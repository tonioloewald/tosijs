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
  // built site; `bun run tunnel` exposes THIS machine's dev server (authenticated,
  // magic-link) for remote editing. The box config lives in tosijs-ui/deploy/ —
  // *.dev.tosijs.net wildcards there, deploys self-register their hostname, but
  // the tunnel hostname below needs its block added to the shared Caddyfile
  // (edit-tosijs.dev.tosijs.net -> 127.0.0.1:9788).
  preview: {
    host: 'root@212.147.248.15',
    url: 'https://tosijs.dev.tosijs.net',
    tunnel: { remotePort: 9788, url: 'https://edit-tosijs.dev.tosijs.net' },
  },

  host: 'github-pages',
  // honor PORT so the Playwright e2e lane can run its own dev server on a
  // dedicated port (see playwright.config.ts webServer) without colliding
  // with a `bun start` you have open on 8018
  port: Number(process.env.PORT) || 8018,
  epub: { author: 'Tonio Loewald' },
})
