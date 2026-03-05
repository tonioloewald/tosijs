import { expect, test, describe } from 'bun:test'
import {
  Blueprint,
  BlueprintLoader,
  tosiBlueprint,
  tosiLoader,
  blueprint,
  blueprintLoader,
} from './blueprint-loader'
import {
  makeComponent,
  XinBlueprint,
  XinPackagedComponent,
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
    el.blueprintLoaded({} as XinPackagedComponent)
  })

  test('accepts custom blueprintLoaded callback', () => {
    let called = false
    const el = tosiBlueprint({
      blueprintLoaded: () => {
        called = true
      },
    }) as InstanceType<typeof Blueprint>
    el.blueprintLoaded({} as XinPackagedComponent)
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

describe('xin-blueprint (deprecated)', () => {
  test('creates xin-blueprint element', () => {
    const el = blueprint()
    expect(el.tagName.toLowerCase()).toBe('xin-blueprint')
  })

  test('has display: none style via global stylesheet', () => {
    const el = blueprint()
    document.body.appendChild(el)
    const globalStyle = document.head.querySelector('#xin-blueprint-component')
    expect(globalStyle).not.toBeNull()
    expect(globalStyle?.textContent).toContain('display')
    expect(globalStyle?.textContent).toContain('none')
    el.remove()
  })

  test('initializes with default attribute values', () => {
    const el = blueprint() as any
    expect(el.tag).toBe('anon-elt')
    expect(el.src).toBe('')
    expect(el.property).toBe('default')
  })

  test('emits deprecation warning once', () => {
    const warns: string[] = []
    const origWarn = console.warn
    console.warn = (msg: string) => warns.push(msg)
    try {
      _resetDeprecationWarnings()
      const el1 = blueprint()
      document.body.appendChild(el1)
      const el2 = blueprint()
      document.body.appendChild(el2)
      const deprecationWarns = warns.filter((w) => w.includes('deprecated'))
      expect(deprecationWarns.length).toBe(1)
      expect(deprecationWarns[0]).toContain('tosi-blueprint')
      el1.remove()
      el2.remove()
    } finally {
      console.warn = origWarn
    }
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

  test('finds both tosi-blueprint and xin-blueprint children', async () => {
    let loadedCalled = false
    const el = tosiLoader(
      {
        allLoaded() {
          loadedCalled = true
        },
      },
      tosiBlueprint({ tag: 'no-src-a' }),
      blueprint({ tag: 'no-src-b' })
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
})

describe('xin-loader (deprecated)', () => {
  test('creates xin-loader element', () => {
    const el = blueprintLoader()
    expect(el.tagName.toLowerCase()).toBe('xin-loader')
  })

  test('has display: none style via global stylesheet', () => {
    const el = blueprintLoader()
    document.body.appendChild(el)
    const globalStyle = document.head.querySelector('#xin-loader-component')
    expect(globalStyle).not.toBeNull()
    expect(globalStyle?.textContent).toContain('display')
    expect(globalStyle?.textContent).toContain('none')
    el.remove()
  })

  test('calls allLoaded when no blueprints present', async () => {
    let loadedCalled = false
    const el = blueprintLoader({
      allLoaded() {
        loadedCalled = true
      },
    }) as InstanceType<typeof BlueprintLoader>
    document.body.appendChild(el)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(loadedCalled).toBe(true)
    el.remove()
  })

  test('emits deprecation warning once', () => {
    const warns: string[] = []
    const origWarn = console.warn
    console.warn = (msg: string) => warns.push(msg)
    try {
      _resetDeprecationWarnings()
      const el1 = blueprintLoader()
      document.body.appendChild(el1)
      const el2 = blueprintLoader()
      document.body.appendChild(el2)
      const deprecationWarns = warns.filter((w) => w.includes('deprecated'))
      expect(deprecationWarns.length).toBe(1)
      expect(deprecationWarns[0]).toContain('tosi-loader')
      el1.remove()
      el2.remove()
    } finally {
      console.warn = origWarn
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
    const testBlueprint: XinBlueprint = (
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
    const testBlueprint: XinBlueprint = (
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

    const testBlueprint: XinBlueprint = (tag, factory) => {
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
    const testBlueprint: XinBlueprint = (
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
    const asyncBlueprint: XinBlueprint = async (
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
