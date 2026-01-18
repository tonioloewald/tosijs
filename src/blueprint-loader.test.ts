import { expect, test, describe, beforeAll } from 'bun:test'
import {
  Blueprint,
  BlueprintLoader,
  blueprint,
  blueprintLoader,
} from './blueprint-loader'
import {
  makeComponent,
  XinBlueprint,
  XinPackagedComponent,
} from './make-component'
import { Component } from './component'
import { elements } from './elements'

// Create element creators
let blueprintEl: ReturnType<typeof Blueprint.elementCreator>
let loaderEl: ReturnType<typeof BlueprintLoader.elementCreator>

beforeAll(() => {
  blueprintEl = blueprint
  loaderEl = blueprintLoader
})

describe('Blueprint', () => {
  describe('elementCreator', () => {
    test('creates xin-blueprint element', () => {
      const el = blueprintEl()
      expect(el.tagName.toLowerCase()).toBe('xin-blueprint')
    })

    test('has display: none style via global stylesheet', () => {
      const el = blueprintEl()
      document.body.appendChild(el)
      // styleSpec creates a global stylesheet, not a shadowDOM
      const globalStyle = document.head.querySelector(
        '#xin-blueprint-component'
      )
      expect(globalStyle).not.toBeNull()
      expect(globalStyle?.textContent).toContain('display')
      expect(globalStyle?.textContent).toContain('none')
      el.remove()
    })
  })

  describe('attributes', () => {
    test('initializes with default values', () => {
      const el = blueprintEl() as Blueprint
      expect(el.tag).toBe('anon-elt')
      expect(el.src).toBe('')
      expect(el.property).toBe('default')
    })

    test('accepts tag attribute', () => {
      const el = blueprintEl({ tag: 'custom-tag' }) as Blueprint
      document.body.appendChild(el)
      expect(el.tag).toBe('custom-tag')
      el.remove()
    })

    test('accepts src attribute', () => {
      const el = blueprintEl({
        src: 'https://example.com/blueprint.js',
      }) as Blueprint
      document.body.appendChild(el)
      expect(el.src).toBe('https://example.com/blueprint.js')
      el.remove()
    })

    test('accepts property attribute', () => {
      const el = blueprintEl({ property: 'namedExport' }) as Blueprint
      document.body.appendChild(el)
      expect(el.property).toBe('namedExport')
      el.remove()
    })
  })

  describe('blueprintLoaded callback', () => {
    test('has default no-op callback', () => {
      const el = blueprintEl() as Blueprint
      expect(typeof el.blueprintLoaded).toBe('function')
      // Should not throw
      el.blueprintLoaded({} as XinPackagedComponent)
    })

    test('accepts custom callback', () => {
      let called = false
      const el = blueprintEl({
        blueprintLoaded: () => {
          called = true
        },
      }) as Blueprint
      el.blueprintLoaded({} as XinPackagedComponent)
      expect(called).toBe(true)
    })
  })
})

describe('BlueprintLoader', () => {
  describe('elementCreator', () => {
    test('creates xin-loader element', () => {
      const el = loaderEl()
      expect(el.tagName.toLowerCase()).toBe('xin-loader')
    })

    test('has display: none style via global stylesheet', () => {
      const el = loaderEl()
      document.body.appendChild(el)
      // styleSpec creates a global stylesheet, not a shadowDOM
      const globalStyle = document.head.querySelector('#xin-loader-component')
      expect(globalStyle).not.toBeNull()
      expect(globalStyle?.textContent).toContain('display')
      expect(globalStyle?.textContent).toContain('none')
      el.remove()
    })
  })

  describe('allLoaded callback', () => {
    test('has default no-op callback', () => {
      const el = loaderEl() as BlueprintLoader
      expect(typeof el.allLoaded).toBe('function')
      // Should not throw
      el.allLoaded()
    })

    test('accepts custom callback', () => {
      let called = false
      const el = loaderEl({
        allLoaded: () => {
          called = true
        },
      }) as BlueprintLoader
      el.allLoaded()
      expect(called).toBe(true)
    })
  })

  describe('loading behavior', () => {
    test('calls allLoaded when no blueprints present', async () => {
      let loadedCalled = false
      const el = loaderEl({
        allLoaded() {
          loadedCalled = true
        },
      }) as BlueprintLoader
      document.body.appendChild(el)

      // Wait for async load to complete
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(loadedCalled).toBe(true)
      el.remove()
    })

    test('filters blueprints without src', async () => {
      let loadedCalled = false
      const el = loaderEl(
        {
          allLoaded() {
            loadedCalled = true
          },
        },
        blueprintEl({ tag: 'no-src-tag' }) // No src attribute
      ) as BlueprintLoader
      document.body.appendChild(el)

      // Wait for async load to complete
      await new Promise((resolve) => setTimeout(resolve, 50))

      expect(loadedCalled).toBe(true)
      el.remove()
    })
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
      // Simulate async operation
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

describe('Blueprint static properties', () => {
  test('Blueprint.tagName is set', () => {
    expect(Blueprint.tagName).toBe('xin-blueprint')
  })

  test('BlueprintLoader.tagName is set', () => {
    expect(BlueprintLoader.tagName).toBe('xin-loader')
  })
})
