import {
  elements,
  tosi,
  vars,
  bindings,
  touch,
  getListItem,
  StyleSheet,
  version,
  bind,
  hotReload,
  debounce,
  Color,
} from 'tosijs'

import {
  icons,
  markdownViewer,
  MarkdownViewer,
  LiveExample,
  sideNav,
  SideNav,
  sizeBreak,
  popMenu,
  version as uiVersion,
} from 'tosijs-ui'

import { styleSpec } from './style'
StyleSheet('demo-style', styleSpec)

import * as tosijs from 'tosijs'
import * as tosijsui from 'tosijs-ui'

import docs from './docs.json'

const PROJECT = 'tosijs'

setTimeout(() => {
  const brandColor = Color.fromVar(vars.brandColor)
  const background = Color.fromVar(vars.background)

  console.log(
    `welcome to %c${PROJECT}`,
    `background: ${brandColor.html}; color: ${background.html}; padding: 0 5px;`
  )
}, 100)

const docName =
  document.location.search !== ''
    ? document.location.search.substring(1).split('&')[0]
    : 'README.md'
const currentDoc = docs.find((doc) => doc.filename === docName) || docs[0]

const { app, prefs } = tosi({
  app: {
    title: PROJECT,
    blogUrl: `https://loewald.com`,
    discordUrl: `https://discord.com/invite/ramJ9rgky5`,
    githubUrl: `https://github.com/tonioloewald/${PROJECT}#readme`,
    npmUrl: `https://www.npmjs.com/package/${PROJECT}`,
    tosijsuiUrl: 'https://ui.tosijs.net',
    bundleBadgeUrl: `https://deno.bundlejs.com/?q=${PROJECT}&badge=`,
    bundleUrl: `https://bundlejs.com/?q=${PROJECT}`,
    cdnBadgeUrl: `https://data.jsdelivr.com/v1/package/npm/${PROJECT}/badge`,
    cdnUrl: `https://www.jsdelivr.com/package/npm/${PROJECT}`,
    optimizeLottie: false,
    lottieFilename: '',
    lottieData: '',
    docs,
    currentDoc,
    compact: false,
  },
  prefs: {
    theme: 'system',
    highContrast: false,
    monochrome: false,
    locale: '',
  },
})

hotReload((path) => {
  if (path.startsWith('prefs')) {
    return true
  }
  return false
})

bindings.docLink = {
  toDOM(elt, filename) {
    elt.setAttribute('href', `?${filename}`)
  },
}

bindings.current = {
  toDOM(elt, currentFile) {
    const boundFile = elt.getAttribute('href') || ''
    elt.classList.toggle('current', currentFile === boundFile.substring(1))
  },
}

setTimeout(() => {
  // provide globals for experimentation, but prevent them from masking compile bugs
  Object.assign(globalThis, {
    app,
    tosi,
    img,
    bindings,
    elements,
    vars,
    touch,
    Color,
  })
}, 1000)

const main = document.querySelector('main') as HTMLElement | null

const { h2, div, span, a, img, header, button, template, input } = elements

bind(document.body, 'prefs.theme', {
  toDOM(element, theme) {
    if (theme === 'system') {
      theme =
        getComputedStyle(document.body).getPropertyValue('--darkmode') ===
        'true'
          ? 'dark'
          : 'light'
    }
    element.classList.toggle('darkmode', theme === 'dark')
  },
})

bind(document.body, prefs.highContrast, {
  toDOM(element, highContrast) {
    element.classList.toggle('high-contrast', highContrast.valueOf())
  },
})

bind(document.body, prefs.monochrome, {
  toDOM(element, monochrome) {
    element.classList.toggle('monochrome', monochrome.valueOf())
  },
})

window.addEventListener('popstate', () => {
  const filename = window.location.search.substring(1)
  app.currentDoc =
    app.docs.find((doc) => doc.filename.xinValue === filename) || app.docs[0]
})

const filterDocs = debounce(() => {
  console.time('filter')
  const needle = searchField.value.toLocaleLowerCase()
  app.docs.forEach((doc: any) => {
    doc.hidden =
      !doc.title.toLocaleLowerCase().includes(needle) &&
      !doc.text.toLocaleLowerCase().includes(needle)
  })
  touch(app.docs)
  console.timeEnd('filter')
})

const searchField = input({
  slot: 'nav',
  placeholder: 'search',
  type: 'search',
  style: {
    width: 'calc(100% - 10px)',
    margin: '5px',
  },
  onInput: filterDocs,
})

if (main)
  main.append(
    header(
      button(
        {
          class: 'iconic',
          style: { color: vars.linkColor },
          title: 'navigation',
          bind: {
            value: app.compact,
            binding: {
              toDOM(element, compact) {
                element.style.display = compact ? '' : 'none'
                ;(element.nextSibling as HTMLElement).style.display = compact
                  ? ''
                  : 'none'
              },
            },
          },
          onClick() {
            const nav = document.querySelector(SideNav.tagName!) as SideNav
            nav.contentVisible = !nav.contentVisible
          },
        },
        icons.menu()
      ),
      span({ style: { flex: '0 0 10px' } }),
      a(
        {
          href: '/',
          style: {
            display: 'flex',
            alignItems: 'center',
            borderBottom: 'none',
          },
          title: `tosijs ${version}, tosijs-ui ${uiVersion}`,
        },
        img({ src: 'favicon.svg', style: { height: 40, marginRight: 10 } }),
        h2({ bindText: 'app.title' })
      ),
      span({ class: 'elastic' }),
      sizeBreak(
        {
          minWidth: 750,
        },
        span(
          {
            style: {
              marginRight: vars.spacing,
              display: 'flex',
              alignItems: 'center',
              gap: vars.spacing50,
            },
          },
          a(
            { href: app.bundleUrl },
            img({ alt: 'bundlejs size badge', src: app.bundleBadgeUrl })
          ),
          a(
            { href: app.cdnUrl },
            img({ alt: 'jsdelivr', src: app.cdnBadgeUrl })
          )
        ),
        span({ slot: 'small' })
      ),
      span({ style: { flex: '0 0 10px' } }),
      button(
        {
          title: 'theme',
          class: 'iconic',
          onClick(event) {
            popMenu({
              target: event.target.closest('button') as HTMLButtonElement,
              menuItems: [
                {
                  icon: 'github',
                  caption: 'github',
                  action: app.githubUrl.xinValue,
                },
                {
                  icon: 'npm',
                  caption: 'npm',
                  action: app.npmUrl.xinValue,
                },
                {
                  icon: 'discord',
                  caption: 'discord',
                  action: app.discordUrl.xinValue,
                },
                {
                  icon: 'tosiUi',
                  caption: 'tosijs-ui',
                  action: app.tosijsuiUrl.xinValue,
                },
                {
                  icon: 'blog',
                  caption: 'Blog',
                  action: 'https://loewald.com',
                },
                null,
                {
                  icon: 'rgb',
                  caption: 'Color Theme',
                  menuItems: [
                    {
                      caption: 'System',
                      checked() {
                        return prefs.theme.xinValue === 'system'
                      },
                      action() {
                        prefs.theme.xinSet('system')
                      },
                    },
                    {
                      caption: 'Dark',
                      checked() {
                        return prefs.theme.xinValue === 'dark'
                      },
                      action() {
                        prefs.theme.xinSet('dark')
                      },
                    },
                    {
                      caption: 'Light',
                      checked() {
                        return prefs.theme.xinValue === 'light'
                      },
                      action() {
                        prefs.theme.xinSet('light')
                      },
                    },
                    null,
                    {
                      caption: 'High Contrast',
                      checked() {
                        return prefs.highContrast.xinValue
                      },
                      action() {
                        prefs.highContrast.xinSet(!prefs.highContrast.valueOf())
                      },
                    },
                    {
                      caption: 'Monochrome',
                      checked() {
                        return prefs.monochrome.xinValue
                      },
                      action() {
                        prefs.monochrome.xinSet(!prefs.monochrome.valueOf())
                      },
                    },
                  ],
                },
              ],
            })
          },
        },
        icons.moreVertical()
      )
    ),
    sideNav(
      {
        name: 'Documentation',
        navSize: 200,
        minSize: 600,
        style: {
          flex: '1 1 auto',
          overflow: 'hidden',
        },
        onChange(event) {
          const nav = document.querySelector(SideNav.tagName!) as SideNav
          app.compact.xinSet(nav.compact)
        },
      },
      searchField,
      div(
        {
          slot: 'nav',
          style: {
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            overflowY: 'scroll',
          },
          bindList: {
            hiddenProp: 'hidden',
            value: app.docs,
          },
        },
        template(
          a({
            class: 'doc-link',
            bindCurrent: 'app.currentDoc.filename',
            bindDocLink: '^.filename',
            bindText: '^.title',
            onClick(event: Event) {
              const a = (event.target as HTMLElement).closest(
                'a'
              ) as HTMLAnchorElement
              if (!a) {
                return
              }
              const doc = getListItem(event.target as HTMLElement)
              const nav = (event.target as HTMLElement).closest(
                'xin-sidenav'
              ) as SideNav
              nav.contentVisible = true
              const { href } = a
              window.history.pushState({ href }, '', href)
              app.currentDoc = doc
              event.preventDefault()
            },
          })
        )
      ),
      div(
        {
          style: {
            position: 'relative',
            overflowY: 'scroll',
            height: '100%',
          },
        },
        markdownViewer({
          style: {
            display: 'block',
            maxWidth: '44em',
            margin: 'auto',
            padding: `0 1em`,
            overflow: 'hidden',
          },
          bindValue: 'app.currentDoc.text',
          didRender(this: MarkdownViewer) {
            LiveExample.insertExamples(this, { tosijs, 'tosijs-ui': tosijsui })
          },
        })
      )
    )
  )
