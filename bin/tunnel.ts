/*
Expose THIS machine's dev server at an authenticated public URL.

  bun run tunnel          # open the tunnel (foreground; Ctrl-C closes it)
  bun run tunnel --status # is one already up?
  bun run tunnel --close  # close any tunnel this project opened
  bun run tunnel --link   # ask the dev server to print a fresh single-use edit link

The work happens where the data is. The repo, the dev server, the build and the
watcher all stay here; the box terminates TLS and checks a password and does no
compute at all. That is what makes it scale — N projects tunnel their own workspace
to one small VPS, rather than the VPS trying to be a build farm.

WHY THIS IS SAFE, given the dev server's source endpoints are otherwise loopback-only:

  - The box runs sshd with `GatewayPorts no`, so the forwarded port is bound to
    127.0.0.1 THERE and is not reachable from the internet. Caddy is the only thing
    that can talk to it, and Caddy demands basicauth first.
  - `ssh -R` delivers to `localhost` HERE, so the dev server sees a loopback peer and
    its read/write endpoints work — correctly, because reaching that socket at all
    required passing the front door. The location check and the authentication check
    compose rather than fight.

So: closed by default, open only through something that authenticates.
*/

import { $ } from 'bun'
import siteConfig from '../tosijs-site.config'

const args = process.argv.slice(2)
const has = (n: string) => args.includes(`--${n}`)
const flag = (n: string) => {
  const hit = args.find((a) => a.startsWith(`--${n}=`))
  return hit ? hit.slice(n.length + 3) : undefined
}

const preview = (siteConfig as { preview?: { host?: string; tunnel?: { remotePort?: number; url?: string } } }).preview
const host = flag('host') ?? process.env.PREVIEW_HOST ?? preview?.host
const localPort = Number(flag('port') ?? process.env.PORT ?? siteConfig.port ?? 8787)
const remotePort = Number(flag('remote-port') ?? preview?.tunnel?.remotePort ?? 9787)
const publicUrl = flag('url') ?? preview?.tunnel?.url

if (!host) {
  console.error(
    `\nNo tunnel host. Set \`preview.host\` in your site config, or pass --host=user@box.\n`
  )
  process.exit(1)
}

/** pgrep pattern that matches only OUR forward, so --close can't kill someone else's. */
const pattern = `ssh .*-R ${remotePort}:localhost:${localPort} ${host}`

async function running(): Promise<number[]> {
  const out = await $`pgrep -f ${pattern}`.nothrow().quiet().text()
  return out.trim().split('\n').filter(Boolean).map(Number)
}

if (has('link')) {
  // The running dev server owns the token store, so ask IT for a link rather than
  // minting one here — a token this process invented would not be recognised.
  // SIGUSR2 makes the server print a fresh single-use link to its own stdout.
  const pids = (await $`pgrep -f ${'bun bin/dev.ts'}`.nothrow().quiet().text())
    .trim().split('\n').filter(Boolean)
  if (!pids.length) {
    console.error('\nNo dev server running — start `bun start` first.\n')
    process.exit(1)
  }
  for (const pid of pids) {
    try {
      process.kill(Number(pid), 'SIGUSR2')
    } catch {
      /* gone */
    }
  }
  console.log(
    `\nAsked the dev server (pid ${pids.join(', ')}) to print a fresh edit link —\n` +
      `see its terminal. Valid 15 minutes, single use.\n`
  )
  process.exit(0)
}

if (has('status')) {
  const pids = await running()
  console.log(
    pids.length
      ? `tunnel UP (pid ${pids.join(', ')}) — ${publicUrl ?? `remote :${remotePort}`}`
      : 'tunnel down'
  )
  process.exit(0)
}

if (has('close')) {
  const pids = await running()
  for (const pid of pids) {
    try {
      process.kill(pid, 'SIGTERM')
    } catch {
      /* already gone */
    }
  }
  console.log(pids.length ? `closed (pid ${pids.join(', ')})` : 'nothing to close')
  process.exit(0)
}

// Refuse to open a second one: two forwards racing for the same remote port means
// whichever sshd accepted first wins and the other silently does nothing, which
// presents as "my edits go to the wrong machine".
const existing = await running()
if (existing.length) {
  console.log(
    `Tunnel already up (pid ${existing.join(', ')}). ` +
      `Use --close first, or --status.\n${publicUrl ?? ''}`
  )
  process.exit(0)
}

// Is the dev server actually up? A tunnel to nothing yields a confusing 502 at the
// far end rather than an obvious local error.
const alive = await $`curl -sk --max-time 4 -o /dev/null https://localhost:${localPort}/`
  .nothrow()
  .quiet()
if (alive.exitCode !== 0) {
  console.warn(
    `⚠️  Nothing answering on https://localhost:${localPort} — start \`bun start\` first,\n` +
      `   or the public URL will 502.\n`
  )
}

console.log(`\n🔌 ${host}  :${remotePort} → localhost:${localPort}`)
if (publicUrl) console.log(`   ${publicUrl}`)
console.log(`   Ctrl-C to close.\n`)

// -N: forwarding only, no remote command.
// ExitOnForwardFailure: if the remote port is taken, fail loudly instead of sitting
// there forwarding nothing while the URL 502s.
// ServerAliveInterval: NAT and hotel wifi drop idle connections silently.
const proc = Bun.spawn(
  [
    'ssh',
    '-N',
    '-o', 'ExitOnForwardFailure=yes',
    '-o', 'ServerAliveInterval=30',
    '-o', 'ServerAliveCountMax=3',
    '-R', `${remotePort}:localhost:${localPort}`,
    host,
  ],
  { stdout: 'inherit', stderr: 'inherit' }
)

const close = () => {
  try {
    proc.kill()
  } catch {
    /* already gone */
  }
}
process.on('SIGINT', () => {
  close()
  process.exit(0)
})
process.on('SIGTERM', () => {
  close()
  process.exit(0)
})

const code = await proc.exited
if (code !== 0) console.error(`\nssh exited ${code}`)
process.exit(code ?? 0)
