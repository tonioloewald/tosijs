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
  docPaths: ['src', 'README.md', 'Building-Apps.md', 'Migration.md', 'React.md'],
  staticDirs: ['demo/static'],

  host: 'github-pages',
  port: 8018,
})
