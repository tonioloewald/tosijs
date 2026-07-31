import { defineSiteConfig } from 'tosijs-ui/site'

const PROJECT = 'tosijs'

export default defineSiteConfig({
  name: PROJECT,
  description:
    'Path-based state management for web apps — proxy-based observers, no JSX, no virtual DOM, ~15kB gzipped.',
  baseUrl: 'https://tosijs.net',

  projectLinks: {
    github: `https://github.com/tonioloewald/${PROJECT}`,
  },
  navbarLinks: [
    { href: 'https://ui.tosijs.net', label: 'tosijs-ui', icon: 'tosi' },
    {
      href: 'https://discord.com/invite/ramJ9rgky5',
      label: 'discord',
      icon: 'discord',
    },
    { href: 'https://loewald.com', label: 'blog', icon: 'blog' },
    {
      href: `https://github.com/tonioloewald/${PROJECT}`,
      label: 'github',
      icon: 'github',
    },
    {
      href: `https://www.npmjs.com/package/${PROJECT}`,
      label: 'npmjs',
      icon: 'npm',
    },
  ],

  favicon: '/favicon.svg',

  libraryTsconfig: './tsconfig.build.json',
  docPaths: [
    'src',
    'README.md',
    'Building-Apps.md',
    'Migration.md',
    'React.md',
    'Angular.md',
    // branch-only for now: the ONE USER INTERFACE plan-ifesto (private branch)
    'ONE_USER_INTERFACE.md',
    'ONE_UI_DERIVED.md',
    'ONE_UI_DESIGN.md',
    'ONE_UI_TRUST.md',
    'ONE_UI_HEADLESS.md',
    'ONE_UI_PLAN.md',
  ],
  staticDirs: ['demo/static'],

  // dev-only: let the in-browser "edit page source" / live-example "Save to
  // source" read+write the actual repo files via /__docstore/source. Off by
  // default, which makes edit-source fall back to GitHub raw (the last COMMITTED
  // version) — so local, uncommitted edits show stale until this is enabled.
  editableSources: true,

  // pop (or reuse) a browser tab on interactive dev-server start — self-skips
  // for CI, test mode, and non-TTY launches (e.g. agent-driven background runs)
  openBrowser: true,

  // Preview host — `bun run deploy` (dry run) / `bun run deploy --go` pushes the
  // built site; `bun run tunnel` (tosijs-tunnel bin) exposes THIS machine's dev
  // server (magic-link -> session; requireToken defaults true) for remote
  // editing. Both deploy AND tunnel self-register their Caddy fragments on the
  // box (rc.1) — no shared-config hand-edits. Hostname convention:
  //   tosijs.dev.tosijs.net       read-only static preview (shareable)
  //   tosijs.edit.dev.tosijs.net  live workspace (session, always)
  // remotePort registry (still hand-picked — tosijs-ui#29):
  //   9787 tosijs-ui, 9788 tosijs-3d, 9789 tosijs
  // (the local loopback listener self-allocates as PORT + 1 since rc.2)
  preview: {
    host: 'root@212.147.248.15',
    url: 'https://tosijs.dev.tosijs.net',
    tunnel: {
      remotePort: 9789,
      // matches the server's PORT+1 self-allocation; explicit because the
      // tunnel BIN's fallback is a fixed 8788 (tosijs-ui#39) — they only
      // agree when PORT is 8787
      localPort: 8019,
      url: 'https://tosijs.edit.dev.tosijs.net',
    },
  },

  host: 'github-pages',
  // honor PORT so the Playwright e2e lane can run its own dev server on a
  // dedicated port (see playwright.config.ts webServer) without colliding
  // with a `bun start` you have open on 8018
  port: Number(process.env.PORT) || 8018,
  epub: { author: 'Tonio Loewald' },
})
