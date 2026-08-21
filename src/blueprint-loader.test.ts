import { expect, test, describe } from 'bun:test'
import {
  Blueprint,
  BlueprintLoader,
  tosiBlueprint,
  tosiLoader,
  setModuleLoader,
  blueprintSrcRefusal,
} from './blueprint-loader'
import { settings } from './settings'
import {
  makeComponent,
  TosiBlueprint,
  TosiPackagedComponent,
} from './make-component'
import { _resetDeprecationWarnings } from './metadata'

describe('tosi-blueprint (canonical)', () => {
  test('creates tosi-blueprint element', () => {
    const el = tosiBlueprint()
    expect(el.tagName.toLowerCase()).toBe('tosi-blueprint')
  })

  test('has display: none style via global stylesheet', () => {
    const el = tosiBlueprint()
    document.body.appendChild(el)
    const globalStyle = document.head.querySelector('#tosi-blueprint-component')
    expect(globalStyle).not.toBeNull()
    expect(globalStyle?.textContent).toContain('display')
    expect(globalStyle?.textContent).toContain('none')
    el.remove()
  })

  test('initializes with default attribute values', () => {
    const el = tosiBlueprint() as InstanceType<typeof Blueprint>
    expect(el.tag).toBe('anon-elt')
    expect(el.src).toBe('')
    expect(el.property).toBe('default')
  })

  test('accepts tag attribute', () => {
    const el = tosiBlueprint({ tag: 'custom-tag' }) as InstanceType<
      typeof Blueprint
    >
    document.body.appendChild(el)
    expect(el.tag).toBe('custom-tag')
    el.remove()
  })

  test('accepts src attribute', () => {
    const el = tosiBlueprint({
      src: 'https://example.com/blueprint.js',
    }) as InstanceType<typeof Blueprint>
    document.body.appendChild(el)
    expect(el.src).toBe('https://example.com/blueprint.js')
    el.remove()
  })

  test('accepts property attribute', () => {
    const el = tosiBlueprint({ property: 'namedExport' }) as InstanceType<
      typeof Blueprint
    >
    document.body.appendChild(el)
    expect(el.property).toBe('namedExport')
    el.remove()
  })

  test('has default no-op blueprintLoaded callback', () => {
    const el = tosiBlueprint() as InstanceType<typeof Blueprint>
    expect(typeof el.blueprintLoaded).toBe('function')
    el.blueprintLoaded({} as TosiPackagedComponent)
  })

  test('accepts custom blueprintLoaded callback', () => {
    let called = false
    const el = tosiBlueprint({
      blueprintLoaded: () => {
        called = true
      },
    }) as InstanceType<typeof Blueprint>
    el.blueprintLoaded({} as TosiPackagedComponent)
    expect(called).toBe(true)
  })

  test('does not emit deprecation warning', () => {
    const warns: string[] = []
    const origWarn = console.warn
    console.warn = (msg: string) => warns.push(msg)
    try {
      _resetDeprecationWarnings()
      const el = tosiBlueprint()
      document.body.appendChild(el)
      expect(warns.filter((w) => w.includes('deprecated'))).toEqual([])
      el.remove()
    } finally {
      console.warn = origWarn
    }
  })
})

describe('xin-* blueprint tags (inert in 1.8.0)', () => {
  test('the working implementation is gone; the tags are tombstones', async () => {
    const api = (await import('./index')) as Record<string, unknown>
    expect('tosiBlueprint' in api).toBe(true)
    expect('tosiLoader' in api).toBe(true)
    // the TAGS remain registered — as tombstones, so the markup path can
    // say what happened instead of failing silently (see the tombstone
    // tests below). What's gone is the working implementation behind them.
    expect(customElements.get('tosi-blueprint')).toBeDefined()
  })
})

describe('tosi-loader (canonical)', () => {
  test('creates tosi-loader element', () => {
    const el = tosiLoader()
    expect(el.tagName.toLowerCase()).toBe('tosi-loader')
  })

  test('has display: none style via global stylesheet', () => {
    const el = tosiLoader()
    document.body.appendChild(el)
    const globalStyle = document.head.querySelector('#tosi-loader-component')
    expect(globalStyle).not.toBeNull()
    expect(globalStyle?.textContent).toContain('display')
    expect(globalStyle?.textContent).toContain('none')
    el.remove()
  })

  test('has default no-op allLoaded callback', () => {
    const el = tosiLoader() as InstanceType<typeof BlueprintLoader>
    expect(typeof el.allLoaded).toBe('function')
    el.allLoaded()
  })

  test('accepts custom allLoaded callback', () => {
    let called = false
    const el = tosiLoader({
      allLoaded: () => {
        called = true
      },
    }) as InstanceType<typeof BlueprintLoader>
    el.allLoaded()
    expect(called).toBe(true)
  })

  test('calls allLoaded when no blueprints present', async () => {
    let loadedCalled = false
    const el = tosiLoader({
      allLoaded() {
        loadedCalled = true
      },
    }) as InstanceType<typeof BlueprintLoader>
    document.body.appendChild(el)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(loadedCalled).toBe(true)
    el.remove()
  })

  test('filters blueprints without src', async () => {
    let loadedCalled = false
    const el = tosiLoader(
      {
        allLoaded() {
          loadedCalled = true
        },
      },
      tosiBlueprint({ tag: 'no-src-tag' })
    ) as InstanceType<typeof BlueprintLoader>
    document.body.appendChild(el)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(loadedCalled).toBe(true)
    el.remove()
  })

  test('settles all tosi-blueprint children', async () => {
    let loadedCalled = false
    const el = tosiLoader(
      {
        allLoaded() {
          loadedCalled = true
        },
      },
      tosiBlueprint({ tag: 'no-src-a' }),
      tosiBlueprint({ tag: 'no-src-b' })
    ) as InstanceType<typeof BlueprintLoader>
    document.body.appendChild(el)
    await new Promise((resolve) => setTimeout(resolve, 50))
    // allLoaded fires — both children found (filtered out by no src)
    expect(loadedCalled).toBe(true)
    el.remove()
  })

  test('does not emit deprecation warning', () => {
    const warns: string[] = []
    const origWarn = console.warn
    console.warn = (msg: string) => warns.push(msg)
    try {
      _resetDeprecationWarnings()
      const el = tosiLoader()
      document.body.appendChild(el)
      expect(warns.filter((w) => w.includes('deprecated'))).toEqual([])
      el.remove()
    } finally {
      console.warn = origWarn
    }
  })

  test('a failing blueprint does not wedge the loader; allLoaded still fires (H-11)', async () => {
    const errors: any[] = []
    const origError = console.error
    console.error = (...args: any[]) => errors.push(args)
    let loadedCalled = false
    try {
      const el = tosiLoader(
        {
          allLoaded() {
            loadedCalled = true
          },
        },
        // an unresolvable module — import() rejects
        tosiBlueprint({ tag: 'broken-bp', src: './does-not-exist-xyz.js' })
      ) as InstanceType<typeof BlueprintLoader>
      document.body.appendChild(el)
      await new Promise((resolve) => setTimeout(resolve, 100))
      // Promise.all would have rejected here, leaving allLoaded unfired
      expect(loadedCalled).toBe(true)
      expect(errors.length).toBeGreaterThan(0)
      el.remove()
    } finally {
      console.error = origError
    }
  })

  test('a failed blueprint is not cached as rejected — a later load re-imports (H-11)', async () => {
    const origError = console.error
    console.error = () => {}
    let attempts = 0
    setModuleLoader(async (_src: string) => {
      attempts++
      throw new Error('transient 404')
    })
    try {
      const bp1 = tosiBlueprint({
        tag: 'retry-tag',
        src: './retry-src.js',
      }) as InstanceType<typeof Blueprint>
      document.body.appendChild(bp1)
      await bp1.packaged().catch(() => {})
      bp1.remove()

      const bp2 = tosiBlueprint({
        tag: 'retry-tag',
        src: './retry-src.js',
      }) as InstanceType<typeof Blueprint>
      document.body.appendChild(bp2)
      await bp2.packaged().catch(() => {})
      bp2.remove()

      // old code cached the rejected promise, so the 2nd load reused it:
      // attempts would stay 1. Eviction means the 2nd load re-imported.
      expect(attempts).toBe(2)
    } finally {
      console.error = origError
      setModuleLoader((src: string) => import(src))
    }
  })
})

describe('blueprint src policy (SEC-6)', () => {
  const withSilencedError = async (fn: () => Promise<void>) => {
    const errors: string[] = []
    const origError = console.error
    console.error = (...args: any[]) => errors.push(args.map(String).join(' '))
    try {
      await fn()
    } finally {
      console.error = origError
    }
    return errors
  }

  // a minimal blueprint module, so an ALLOWED src actually packages
  const stubModule = {
    default: ((_tag, { Component: C, elements: e }) => {
      class PolicyStub extends C {
        content = () => e.div('stub')
      }
      return { type: PolicyStub }
    }) as TosiBlueprint,
  }

  const attempt = async (src: string, tag = 'policy-tag') => {
    let attempts = 0
    setModuleLoader(async () => {
      attempts++
      return stubModule
    })
    let error: any = null
    const errors = await withSilencedError(async () => {
      const el = tosiBlueprint({ tag, src }) as InstanceType<typeof Blueprint>
      document.body.appendChild(el)
      await el.packaged().catch((e) => {
        error = e
      })
      el.remove()
    })
    setModuleLoader((s: string) => import(s))
    return { attempts, error, errors }
  }

  test('javascript: is refused unconditionally', async () => {
    const { attempts, error, errors } = await attempt(
      'javascript:window.PWNED=true'
    )
    expect(attempts).toBe(0)
    expect(String(error)).toContain('refused')
    expect(errors.join('\n')).toContain('javascript:window.PWNED=true')
  })

  test('data: is refused unconditionally', async () => {
    const { attempts, error } = await attempt(
      'data:text/javascript,window.PWNED=true'
    )
    expect(attempts).toBe(0)
    expect(String(error)).toContain('refused')
  })

  test('vbscript: is refused unconditionally', async () => {
    const { attempts } = await attempt('vbscript:msgbox(1)')
    expect(attempts).toBe(0)
  })

  test('control characters and whitespace do not smuggle a scheme past the check', async () => {
    for (const src of [
      '  javascript:x=1',
      'java\tscript:x=1',
      'java\nscript:x=1',
      ' javascript:x=1',
      'JavaScript:x=1',
    ]) {
      expect(blueprintSrcRefusal(src)).not.toBeNull()
    }
  })

  test('ordinary http(s) and relative sources are allowed by default (CDN blueprints are the feature)', async () => {
    expect(blueprintSrcRefusal('https://cdn.example.com/bp.js')).toBeNull()
    expect(blueprintSrcRefusal('./local-blueprint.js')).toBeNull()
    expect(blueprintSrcRefusal('/abs/blueprint.js?data:no')).toBeNull()
    const { attempts, error } = await attempt(
      'https://cdn.example.com/ok.js',
      'policy-ok'
    )
    expect(attempts).toBe(1)
    expect(error).toBeNull()
  })

  test('settings.blueprintSrcCheck refuses a source, and the error says how to allow it', async () => {
    settings.blueprintSrcCheck = (src) => src.startsWith('/')
    try {
      const { attempts, error, errors } = await attempt(
        'https://evil.example/x.js',
        'policy-hooked'
      )
      expect(attempts).toBe(0)
      expect(String(error)).toContain('refused')
      expect(errors.join('\n')).toContain('blueprintSrcCheck')
      expect(errors.join('\n')).toContain('https://evil.example/x.js')
    } finally {
      delete settings.blueprintSrcCheck
    }
  })

  test('settings.blueprintSrcCheck sees the element and can allow', async () => {
    let seen: Element | null = null
    settings.blueprintSrcCheck = (_src, el) => {
      seen = el
      return true
    }
    try {
      const { attempts, error } = await attempt(
        'https://cdn.example.com/allowed.js',
        'policy-allowed'
      )
      expect(attempts).toBe(1)
      expect(error).toBeNull()
      expect((seen as unknown as Element)?.tagName.toLowerCase()).toBe(
        'tosi-blueprint'
      )
    } finally {
      delete settings.blueprintSrcCheck
    }
  })

  test('a refused src is not cached — allowing it later still loads', async () => {
    settings.blueprintSrcCheck = () => false
    let attempts = 0
    setModuleLoader(async () => {
      attempts++
      return stubModule
    })
    const origError = console.error
    console.error = () => {}
    try {
      const el1 = tosiBlueprint({
        tag: 'policy-uncached',
        src: 'https://cdn.example.com/uncached.js',
      }) as InstanceType<typeof Blueprint>
      document.body.appendChild(el1)
      await el1.packaged().catch(() => {})
      el1.remove()
      expect(attempts).toBe(0)

      delete settings.blueprintSrcCheck
      const el2 = tosiBlueprint({
        tag: 'policy-uncached',
        src: 'https://cdn.example.com/uncached.js',
      }) as InstanceType<typeof Blueprint>
      document.body.appendChild(el2)
      await el2.packaged().catch(() => {})
      el2.remove()
      expect(attempts).toBe(1)
    } finally {
      console.error = origError
      delete settings.blueprintSrcCheck
      setModuleLoader((s: string) => import(s))
    }
  })

  test('a refused blueprint does not wedge its loader', async () => {
    const origError = console.error
    console.error = () => {}
    let loadedCalled = false
    try {
      const el = tosiLoader(
        {
          allLoaded() {
            loadedCalled = true
          },
        },
        tosiBlueprint({
          tag: 'policy-in-loader',
          src: 'javascript:window.PWNED=true',
        })
      ) as InstanceType<typeof BlueprintLoader>
      document.body.appendChild(el)
      await new Promise((resolve) => setTimeout(resolve, 100))
      expect(loadedCalled).toBe(true)
      el.remove()
    } finally {
      console.error = origError
    }
  })
})

describe('Static properties', () => {
  test('Blueprint.tagName is tosi-blueprint', () => {
    expect(Blueprint.tagName).toBe('tosi-blueprint')
  })

  test('BlueprintLoader.tagName is tosi-loader', () => {
    expect(BlueprintLoader.tagName).toBe('tosi-loader')
  })
})

describe('makeComponent', () => {
  test('creates component from blueprint', async () => {
    const testBlueprint: TosiBlueprint = (
      tag,
      { Component: C, elements: e }
    ) => {
      class TestBlueprintComponent extends C {
        content = () => e.div('Blueprint content')
      }
      return {
        type: TestBlueprintComponent,
        creator: TestBlueprintComponent.elementCreator({ tag }),
      }
    }

    const pkg = await makeComponent('test-blueprint-comp', testBlueprint)
    expect(pkg.type).toBeDefined()
    expect(pkg.creator).toBeDefined()
    expect(typeof pkg.creator).toBe('function')
  })

  test('created component has correct tag', async () => {
    const testBlueprint: TosiBlueprint = (
      tag,
      { Component: C, elements: e }
    ) => {
      class TagTestComponent extends C {
        content = () => e.span('Tag test')
      }
      return {
        type: TagTestComponent,
        creator: TagTestComponent.elementCreator({ tag }),
      }
    }

    const pkg = await makeComponent('tag-test-component', testBlueprint)
    const el = pkg.creator()
    expect(el.tagName.toLowerCase()).toBe('tag-test-component')
  })

  test('blueprint receives factory with expected properties', async () => {
    let receivedFactory: any = null

    const testBlueprint: TosiBlueprint = (tag, factory) => {
      receivedFactory = factory
      class FactoryTestComponent extends factory.Component {
        content = () => factory.elements.div('Factory test')
      }
      return {
        type: FactoryTestComponent,
        creator: FactoryTestComponent.elementCreator({ tag }),
      }
    }

    await makeComponent('factory-test-comp', testBlueprint)

    expect(receivedFactory).not.toBeNull()
    expect(receivedFactory.Component).toBeDefined()
    expect(receivedFactory.elements).toBeDefined()
    expect(receivedFactory.vars).toBeDefined()
    expect(receivedFactory.varDefault).toBeDefined()
    expect(receivedFactory.xin).toBeDefined()
    expect(receivedFactory.boxed).toBeDefined()
    expect(receivedFactory.tosi).toBeDefined()
    expect(receivedFactory.bind).toBeDefined()
    expect(receivedFactory.on).toBeDefined()
    expect(receivedFactory.Color).toBeDefined()
    expect(typeof receivedFactory.version).toBe('string')
  })

  test('blueprint can use styleSpec', async () => {
    const testBlueprint: TosiBlueprint = (
      tag,
      { Component: C, elements: e }
    ) => {
      class StyledBlueprintComponent extends C {
        static styleSpec = {
          ':host': {
            display: 'block',
            padding: '5px',
          },
        }
        content = () => e.div('Styled blueprint')
      }
      return {
        type: StyledBlueprintComponent,
        creator: StyledBlueprintComponent.elementCreator({ tag }),
      }
    }

    const pkg = await makeComponent('styled-blueprint-comp', testBlueprint)
    const el = pkg.creator()
    document.body.appendChild(el)

    expect(el.shadowRoot).not.toBeNull()
    const style = el.shadowRoot?.querySelector('style')
    expect(style?.textContent).toContain('display')

    el.remove()
  })

  test('async blueprint works', async () => {
    const asyncBlueprint: TosiBlueprint = async (
      tag,
      { Component: C, elements: e }
    ) => {
      await new Promise((resolve) => setTimeout(resolve, 10))

      class AsyncBlueprintComponent extends C {
        content = () => e.div('Async blueprint')
      }
      return {
        type: AsyncBlueprintComponent,
        creator: AsyncBlueprintComponent.elementCreator({ tag }),
      }
    }

    const pkg = await makeComponent('async-blueprint-comp', asyncBlueprint)
    expect(pkg.type).toBeDefined()
    expect(pkg.creator).toBeDefined()

    const el = pkg.creator()
    expect(el.tagName.toLowerCase()).toBe('async-blueprint-comp')
  })
})

describe('xin-* tombstones (1.8.0): removed, but never silent', () => {
  test('the legacy tags register as tombstones that say what to rename', async () => {
    const { _resetDeprecationWarnings } = await import('./metadata')
    // registered — so the message can exist at all
    expect(customElements.get('xin-blueprint')).toBeDefined()
    expect(customElements.get('xin-loader')).toBeDefined()

    _resetDeprecationWarnings()
    const warnings: string[] = []
    const original = console.warn
    console.warn = (...args: any[]) => warnings.push(args.map(String).join(' '))
    let el: HTMLElement
    try {
      el = document.createElement('xin-blueprint')
      // a tag name UNIQUE TO THIS TEST. `legacy-thing` collided with
      // agent.test.ts's post-hoc-contract fixture, and customElements is a
      // process-global registry shared by every test file — so whichever ran
      // first decided the assertion below. Green locally, red on CI, for
      // three weeks of nothing changing: the file order differs per machine.
      el.setAttribute('tag', 'tombstone-probe-thing')
      el.setAttribute('src', './legacy.js')
      document.body.append(el)
    } finally {
      console.warn = original
    }
    // the silent failure the review found is now loud, and actionable
    const warning = warnings.find((w) => w.includes('xin-blueprint'))
    expect(warning).toBeDefined()
    expect(warning).toContain('does NOTHING')
    expect(warning).toContain('<tosi-blueprint>')
    // and it does nothing, which is honest: no hydration is attempted
    expect(customElements.get('tombstone-probe-thing')).toBeUndefined()
    el!.remove()
  })

  test('the CREATORS survive 1.x as deprecated aliases naming 2.0', async () => {
    // 1.7 named a removal version for `data-ref` ONLY — these three were
    // deprecated with no version, so removing them in a MINOR would have
    // broken code that was promised nothing (1.8.0-rc.1 review, B1).
    const api = (await import('./index')) as Record<string, any>
    expect(typeof api.blueprint).toBe('function')
    expect(typeof api.blueprintLoader).toBe('function')
    expect(typeof api.xinSlot).toBe('function')

    const { _resetDeprecationWarnings } = await import('./metadata')
    _resetDeprecationWarnings()
    const warnings: string[] = []
    const original = console.warn
    console.warn = (...args: any[]) => warnings.push(args.map(String).join(' '))
    let el: any
    try {
      el = api.blueprint({ tag: 'aliased-thing', src: './x.js' })
    } finally {
      console.warn = original
    }
    // they WORK (creating the element that actually hydrates)…
    expect(el.tagName.toLowerCase()).toBe('tosi-blueprint')
    // …and they say when they go
    expect(warnings.some((w) => w.includes('REMOVED IN 2.0'))).toBe(true)
  })
})
