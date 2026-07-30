/*
Deploy the built site to a preview host.

  bun bin/deploy-preview.ts                 # DRY RUN — shows what would change
  bun bin/deploy-preview.ts --go            # actually sync
  bun bin/deploy-preview.ts --host=me@1.2.3.4 --path=/srv/preview/tosijs-ui --go

Phase 1 of REMOTE-ACCESS-PLAN.md. The whole artifact is ~9MB / ~95 files and a typical
doc change touches 3, so this is a copy, not a deployment pipeline — rsync has done
delta transfer since 1996 and there is no protocol to invent.

Two deliberate safety properties:

  DRY RUN BY DEFAULT. This runs `rsync --delete`, which removes files on the remote
  that aren't present locally. That is correct (the remote should mirror the build)
  and it is destructive if pointed somewhere wrong, so the destructive form must be
  typed on purpose. `--go` is the whole ceremony.

  IT WARNS WHEN THE TREE IS DIRTY. `/version.json` deliberately carries no `dirty`
  flag: it records the last COMMIT, and a build made from a dirty tree may not match
  that commit. Rather than bake a permanently-wrong flag into a committed file, the
  warning lives here — at the moment a human is deciding to publish something, and can
  act on it. This is the other half of that decision (see build-stamp.ts).
*/

import { $ } from 'bun'
import { existsSync } from 'fs'
import { tmpdir } from 'os'
import siteConfig from '../tosijs-site.config'

const args = process.argv.slice(2)
const flag = (name: string): string | undefined => {
  const hit = args.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : undefined
}
const has = (name: string): boolean => args.includes(`--${name}`)

const OUT = siteConfig.outputDir ?? 'docs'
const PROJECT = siteConfig.name ?? 'site'
const preview = (siteConfig as { preview?: { host?: string; path?: string; url?: string } })
  .preview

// Precedence: explicit flag > env > site config. The config is the "just works"
// default; the flag exists so you can push a one-off somewhere else without editing
// (and committing) a config file.
const host = flag('host') ?? process.env.PREVIEW_HOST ?? preview?.host
const remotePath =
  flag('path') ??
  process.env.PREVIEW_PATH ??
  preview?.path ??
  `/srv/preview/${PROJECT}`
const publicUrl = flag('url') ?? preview?.url
const go = has('go')

if (!host) {
  console.error(
    `\nNo preview host.\n\n` +
      `  Set one once in your site config:\n` +
      `      preview: { host: 'user@example.com' }\n\n` +
      `  ...or pass it per-run:\n` +
      `      bun bin/deploy-preview.ts --host=user@example.com [--path=/srv/preview/x] [--go]\n` +
      `      PREVIEW_HOST=user@example.com bun bin/deploy-preview.ts\n`
  )
  process.exit(1)
}

// Never let a typo'd path become `rsync --delete` against something important.
// The remote path must be absolute and more than one level deep.
if (!remotePath.startsWith('/') || remotePath.split('/').filter(Boolean).length < 2) {
  console.error(
    `\n🛑 Refusing to deploy to "${remotePath}".\n\n` +
      `   This runs \`rsync --delete\`, so the target must be an absolute path at\n` +
      `   least two levels deep (e.g. /srv/preview/${PROJECT}) — not a root or a\n` +
      `   top-level directory.\n`
  )
  process.exit(1)
}

if (!existsSync(OUT) || !existsSync(`${OUT}/index.html`)) {
  console.error(
    `\n🛑 No build at ./${OUT} (or it has no index.html). Run \`bun run build\` first.\n`
  )
  process.exit(1)
}

// What are we about to publish? /version.json is the build's identity; printing it
// here closes the loop the stamp exists for — you see the commit BEFORE it ships,
// not only when someone asks "what am I looking at".
let stamp = '(no version.json — build with a current tosijs-ui)'
try {
  const v = JSON.parse(await Bun.file(`${OUT}/version.json`).text())
  stamp = `${v.commit ?? '?'} — ${v.commitTime ?? '?'} (generator ${v.generator})`
} catch {
  // best effort; never block a deploy on the stamp
}

const dirty = (await $`git status --porcelain`.nothrow().quiet().text()).trim()

console.log(`\n📦 ${PROJECT} → ${host}:${remotePath}`)
console.log(`   building from: ${stamp}`)

if (dirty) {
  const n = dirty.split('\n').length
  console.warn(
    `\n⚠️  Working tree has ${n} uncommitted change${n === 1 ? '' : 's'}.\n` +
      `    /version.json records the last COMMIT, so the preview will claim a commit\n` +
      `    that does not describe what you are about to publish. Commit first if the\n` +
      `    identity matters (it usually does when someone else is reviewing).\n`
  )
}

// --delete so the remote mirrors the build exactly (stale pages must not linger);
// -z compresses; --checksum is NOT used — mtime+size is enough and much faster.
const rsyncArgs = [
  '-az',
  '--delete',
  '--human-readable',
  ...(go ? [] : ['--dry-run']),
  '--itemize-changes',
  `${OUT}/`,
  `${host}:${remotePath}/`,
]

if (!go) console.log(`\n🔍 DRY RUN — nothing will change. Add --go to sync.\n`)

const result = await $`rsync ${rsyncArgs}`.nothrow()
if (result.exitCode !== 0) {
  console.error(`\n🛑 rsync failed (exit ${result.exitCode}).`)
  process.exit(1)
}

/*
Self-registration.

When `preview.url` is set, this project publishes its own Caddy fragment naming the
hostname and the directory it serves. The central Caddyfile glob-imports
/srv/preview/_sites/*.caddy, so a new project needs no edit to any shared file and no
DNS change — deploying IS registering.

The fragment is the single source of truth for hostname→directory: the index page
reads these same files, so the listing cannot drift from the router. (It did, once:
the index derived hostnames from directory names and linked
tosijs-ui.dev.tosijs.net at a site actually served from ui.dev.tosijs.net.)

Validate before reloading, and do not reload if invalid. One malformed fragment would
otherwise fail the reload for EVERY project on the box — so a bad config leaves the
previous good one serving, exactly as a failed build leaves the last good site up.
*/
async function registerSite(): Promise<void> {
  if (!publicUrl) return
  let hostname: string
  try {
    hostname = new URL(publicUrl).hostname
  } catch {
    console.warn(`⚠️  preview.url is not a URL (${publicUrl}) — skipping registration.`)
    return
  }

  // Staged through a local temp file and scp'd: Bun's shell has no herestring, and
  // building a remote `cat > file` out of an interpolated string is how you end up
  // with a quoting bug that writes something surprising as root.
  const local = `${tmpdir()}/${PROJECT}.caddy`
  await Bun.write(
    local,
    `# Generated by \`bun run deploy\` for ${PROJECT}. Do not hand-edit.\n` +
      `${hostname} {\n\troot * ${remotePath}\n\timport preview_site\n}\n`
  )

  const mk = await $`ssh ${host} mkdir -p /srv/preview/_sites`.nothrow().quiet()
  const put =
    await $`scp -q ${local} ${`${host}:/srv/preview/_sites/${PROJECT}.caddy`}`.nothrow().quiet()
  if (mk.exitCode !== 0 || put.exitCode !== 0) {
    console.warn(`⚠️  could not register ${hostname} — site deployed, routing unchanged.`)
    return
  }

  // Validate with the SAME environment systemd gives Caddy. The basicauth hash comes
  // from an EnvironmentFile (kept out of this public repo), and a bare `caddy validate`
  // does not load it — so {env.PREVIEW_HASH} resolves empty and validation fails with
  // "username and password are required" on a config that is actually fine. That would
  // fail CLOSED forever: every deploy would decline to reload and routing would freeze.
  const check =
    await $`ssh ${host} ${'set -a; . /etc/caddy/preview.env 2>/dev/null; set +a; caddy validate --config /etc/caddy/Caddyfile'}`
      .nothrow()
      .quiet()
  if (check.exitCode !== 0) {
    // Leave the fragment so the error is inspectable, but do NOT reload: one bad
    // fragment would fail the reload for EVERY project on the box.
    console.error(
      `\n🛑 Caddy config invalid after registering ${hostname} — NOT reloading.\n` +
        `   The previous config keeps serving. Fix or remove\n` +
        `   /srv/preview/_sites/${PROJECT}.caddy on the host.\n` +
        (check.stderr.toString() || check.stdout.toString()).trim().split('\n').slice(-4).join('\n')
    )
    return
  }
  await $`ssh ${host} systemctl reload caddy`.nothrow().quiet()
  console.log(`   registered ${hostname} → ${remotePath}`)
}

/** Refresh the host's index so this deploy shows up immediately. */
async function refreshIndex(): Promise<void> {
  const remote = `/tmp/tosi-build-index-${process.pid}.sh`
  const put = await $`scp -q ${'deploy/build-index.sh'} ${`${host}:${remote}`}`.nothrow().quiet()
  if (put.exitCode !== 0) return
  const run = await $`ssh ${host} bash ${remote}`.nothrow().quiet()
  await $`ssh ${host} rm -f ${remote}`.nothrow().quiet()
  const out = run.stdout.toString().trim()
  if (out) console.log(`   ${out}`)
}

if (go) {
  await registerSite()
  await refreshIndex()
}

console.log(
  go
    ? `\n✅ Deployed. ${stamp}` + (publicUrl ? `\n   ${publicUrl}\n` : '\n')
    : `\nDry run complete — re-run with --go to apply.\n`
)
