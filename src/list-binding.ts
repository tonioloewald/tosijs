/*#
# 2.1 binding arrays

The most likely source of complexity and performance issues in applications is
displaying large lists or grids of objects. `tosijs` provides robust support
for handling this efficiently.

## `bindList` and `bindings.list`

The basic structure of a **list-binding** is:

    div( // container element
      {
        bindList: {
          value: boxed.path.to.array // OR 'path.to.array'
          idPath: 'id' // (optional) path to unique id of array items
        }
      },
      template( // template for the repeated item
        div( // repeated item should have a single root element
          ... // whatever you want
          span({
            bindText: '^.foo.bar' // binding to a given array member's `foo.bar`
              // '^' refers to the array item itself
          })
        )
      )
    )

```js
  import { elements, tosi } from 'tosijs'
  const { listBindingExample } = tosi({
    listBindingExample: {
      array: ['this', 'is', 'an', 'example']
    }
  })

  const { h3, ul, li, template } = elements

  preview.append(
    h3('binding an array of strings'),
    ul(
      ...listBindingExample.array.tosiListBinding(({li}, item) => li(item))
    )
  )
```

### tosiListBinding(templateBuilder: ListTemplateBuilder, options?: ListBindingOptions) => [ElementProps, HTMLTemplateElement]

    type ListTemplateBuilder<U = any> = (elements: ElementsProxy, item: U) => HTMLElement
    type ListBinding = [ElementProps, HTMLTemplateElement]

The example leverages new syntax sugar that makes list-binding simpler
and more intuitive. (It's intended to be as convenient as mapping an array to elements,
except that you get dynamic binding, virtualized lists, versus a static list.)

If you have a BoxedProxy<T[]>, you can use `tosiListBinding()`
to create the binding inline (see the example above). Under the hood, the template
gets created and an object with the necessary specifications is produced.

Even better, `templateBuilder()` is passed the `elements` proxy and a placeholder `BoxedProxy` of
the array's type, supporting autocompletion of property names within the template.

### id-paths

**id-paths** are a wrinkle in `xin`'s paths specifically there to make list-binding more efficient.
This is because in many cases you will encounter large arrays of objects, each with a unique id somewhere, e.g. it might be `id` or `uid`
or even buried deeper…

    xin.message = [
      {
        id: '1234abcd',
        title: 'hello',
        body: 'hello there!'
      },
      …
    ]

Instead of referring to the first item in `messages` as `messages[0]` it can be referred to
as `messages[id=1234abcd]`, and this will retrieve the item regardless of its position in messages.

Specifying an `idPath` in a list-binding will allow the list to be more efficiently updated.
It's the equivalent of a `key` in React, the difference being that it's optional and
specifically intended to leverage pre-existing keys where available.

### When to use idPath

**Always use `idPath` for arrays of objects** unless you have a very simple case.

Without `idPath`:
- Bindings use index-based paths like `list[0].name`
- If items are reordered (sort, splice, etc.), bindings point to wrong items
- Fine-grained property updates may not reach the correct DOM elements
- The list binding will work, but inefficiently - often recreating elements

Without `idPath` is fine for:
- Simple arrays of scalars (`['apple', 'banana', 'cherry']`)
- Static lists that never reorder
- Lists where you always replace items wholesale, never update properties

### Surgical Updates with id-paths

When you specify an `idPath`, something remarkable happens: changes to individual
item properties trigger surgical DOM updates without re-rendering the entire list.

Here's how it works:

1. When a list binding is created with an `idPath`, tosijs registers that array path
2. When you modify an item property (e.g., `list[0].color = 'red'`), tosijs detects
   this is inside an array item
3. It automatically synthesizes an equivalent id-path touch (e.g., `list[id=123].color`)
4. Bindings registered with id-path notation receive the update

This means you can update one property on one item in a list of millions, and only
that single DOM element updates. No diffing, no virtual DOM, no reconciliation -
just direct, surgical updates.

**To see this in action:** Open your browser's DevTools, enable "Paint flashing"
(in Chrome: DevTools → More tools → Rendering → Paint flashing), and watch the
virtualized grid example below. Only the cells whose values actually change will flash.

## Iterating and Searching Arrays

When working with proxied arrays, it's important to understand how different
iteration patterns behave:

### `for...of` loops yield proxied items

```js
for (const item of list) {
  // item is a proxy - use .value for scalars
  console.log(item.name.value)

  // mutations trigger observers and surgical DOM updates
  item.score.value = 100
}
```

### `find()`, `findLast()`, and `at()` return proxied items

```js
// The predicate receives raw items - no .value needed for comparisons
const found = list.find(item => item.id === 'abc')

// The result is proxied - mutations work and trigger updates
found.score.value = 100
```

This is the best of both worlds: clean predicate syntax without `.value`,
and the returned item is fully reactive.

### `forEach()`, `map()`, `filter()`, etc. pass raw items to callbacks

```js
// Callbacks receive raw items for clean predicate/transform syntax
list.filter(item => item.score > 50)
list.map(item => item.name)

// But mutations in forEach won't trigger observers!
list.forEach(item => {
  item.score = 100  // Modifies raw object - NO observer triggered
})
```

If you need to mutate items, use `for...of` instead, or call `touch()` on
the array or individual items after your `forEach`:

```js
// Option 1: Use for...of
for (const item of list) {
  item.score.value = 100  // Triggers observers
}

// Option 2: Touch after forEach
list.forEach(item => {
  item.score = 100
})
touch('path.to.list')  // Manually notify observers
```

## Virtualized Lists

The real power of `bindList` comes from its support for virtualizing lists.

    bindList: {
      value: emojiListExample.array,
      idPath: 'name',
      virtual: {
        height: 30,
        rowChunkSize: 3,
      },
    }

Simply add a `virtual` property to the list-binding specifying a *minimum* `height` (and, optionally,
`height`) and the list will be `virtualized` (meaning that only visible elements will be rendered,
missing elements being replaced by a single padding element above and below the list).

You can (optionally) specify `rowChunkSize` to virtualize the list in chunks of rows to allow
consistent `:nth-child()` styling.

Now you can trivially bind an array of a million objects to the DOM and have it scroll at
120fps.

```js
import { elements, tosi } from 'tosijs'
const request = await fetch(
  'https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json'
)
const { emojiListExample } = tosi({
  emojiListExample: {
    array: await request.json()
  }
})

const { div } = elements

preview.append(
  div(
    {
      class: 'emoji-table'
    },
    ...emojiListExample.array.tosiListBinding(({div, span}, item) =>
      div(
        {
          class: 'emoji-row',
          tabindex: 0,
        },
        span({ bindText: item.chars, class: 'graphic' }),
        span({ bindText: item.name, class: 'no-overflow' }),
        span({ bindText: item.category, class: 'no-overflow' }),
        span({ bindText: item.subcategory, class: 'no-overflow' })
      ),
      {
        value: emojiListExample.array,
        idPath: 'name',
        virtual: {
          height: 30,
          rowChunkSize: 3
        },
      }
    )
  )
)
```
```css
.emoji-table {
  height: 100%;
  overflow: auto;
}
.emoji-row {
  display: grid;
  grid-template-columns: 50px 300px 200px 200px;
  align-items: center;
  height: 30px;
  overflow-x: hidden;
}
.emoji-row:nth-child(3n) {
  background: #f002;
}
.emoji-row:nth-child(3n+2) {
  background: #00f2;
}

.emoji-row > .graphic {
  font-size: 20px;
  justify-self: center;
}

.emoji-row > * {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### Virtualized Grids

You can virtualize a grid by styling the padding elements (with class `.virtual-list-padding`)
to have the correct column span. (You can also just specify a fixed `width` for your list.)

This example creates 2000 cells with random text colors, then updates 10% of them
randomly every 500ms. Enable paint flashing to see the surgical updates in action.
Note how `rowChunkSize: 2` allows consistent row shading via `:nth-child()`.

```js
import { elements, tosi } from 'tosijs'

// Generate random saturated colors
const randomColor = () => {
  const h = Math.floor(Math.random() * 360)
  return `hsl(${h}, 80%, 45%)`
}

const list = []
for (let i = 0; i < 2000; i++) {
  list.push({ id: i, color: randomColor() })
}

const { bigBindTest } = tosi({
  bigBindTest: list
})

// Update 10% of items randomly every 500ms
setInterval(() => {
  const count = Math.floor(list.length * 0.1)
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * list.length)
    bigBindTest[idx].color = randomColor()
  }
}, 500)

const { div } = elements

preview.append(
  div(
    {
      class: 'virtual-grid-example',
    },
    ...bigBindTest.tosiListBinding(
      ({div}, item) => div({
        class: 'cell',
        bindText: item.id,
        bind: {
          value: item.color,
          binding: {
            toDOM(el, color) {
              el.style.color = color
            }
          }
        }
      }),
      {
        idPath: 'id',
        virtual: {
          height: 40,
          visibleColumns: 7,
          rowChunkSize: 2,
        }
      }
    )
  )
)
```
```css
.virtual-grid-example {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 14% 14% 14% 14% 14% 14% 14%;
}

.virtual-grid-example .virtual-list-padding {
  grid-column: 1 / 8;
}

.virtual-grid-example .cell {
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-weight: bold;
  transition: color 0.3s ease;
}

.virtual-grid-example .cell:nth-child(14n+2),
.virtual-grid-example .cell:nth-child(14n+3),
.virtual-grid-example .cell:nth-child(14n+4),
.virtual-grid-example .cell:nth-child(14n+5),
.virtual-grid-example .cell:nth-child(14n+6),
.virtual-grid-example .cell:nth-child(14n+7),
.virtual-grid-example .cell:nth-child(14n+8) {
  background: #0001;
}
```

## Filtered Lists

It's also extremely common to want to filter a rendered list, and `tosijs`
provides both simple and powerful methods for doing this.

## `hiddenProp` and `visibleProp`

`hiddenProp` and `visibleProp` allow you to use a property to hide or show array
elements (and they can be `symbol` values if you want to avoid "polluting"
your data, e.g. for round-tripping to a database.)

## `filter` and `needle`

    bindList: {
      value: filterListExample.array,
      idPath: 'name',
      virtual: {
        height: 30,
      },
      filter: (emojis, needle) => {
        needle = needle.trim().toLocaleLowerCase()
        if (!needle) {
          return emojis
        }
        return emojis.filter(emoji => `${emoji.name} ${emoji.category} ${emoji.subcategory}`.toLocaleLowerCase().includes(needle))
      },
      needle: filterListExample.needle
    }

If `bindList`'s options provide a `filter` function and a `needle` (proxy or path) then
the list will be filtered using the function via throttled updates.

`filter` is passed the whole array, and `needle` can be anything so, `filter` can
sort the array or even synthesize it entirely.

In this example the `needle` is an object containing both a `needle` string and `sort`
value, and the `filter` function filters the list if the string is non-empty, and
sorts the list if `sort` is not "default". Also note that an `input` event handler
is used to `touch` the object and trigger updates.

```js
// note that this example is styled by the earlier example

import { elements, tosi } from 'tosijs'
const request = await fetch(
  'https://raw.githubusercontent.com/tonioloewald/emoji-metadata/master/emoji-metadata.json'
)
const { filterListExample } = tosi({
  filterListExample: {
    config: {
      needle: '',
      sort: 'default',
    },
    array: await request.json()
  }
})

const { b, div, span, template, label, input, select, option } = elements

preview.append(
  div(
    {
      style: {
        display: 'flex',
        padding: 10,
        gap: 10,
        height: 60,
        alignItems: 'center'
      },
      onInput() {
        // need to trigger change if any prop of config changes
        touch(filterListExample.config)
      },
    },
    b('filtered list'),
    span({style: 'flex: 1'}),
    label(
      span('sort by'),
      select(
        {
          bindValue: filterListExample.config.sort
        },
        option('default'),
        option('name'),
        option('category')
      ),
    ),
    input({
      type: 'search',
      placeholder: 'filter emoji',
      bindValue: filterListExample.config.needle
    })
  ),
  div(
    {
      class: 'emoji-table',
      style: 'height: calc(100% - 60px)',
    },
    ...filterListExample.array.tosiListBinding(
      ({div, span}, item) => div(
        {
          class: 'emoji-row',
          tabindex: 0,
        },
        span({ bindText: item.chars, class: 'graphic' }),
        span({ bindText: item.name, class: 'no-overflow' }),
        span({ bindText: item.category, class: 'no-overflow' }),
        span({ bindText: item.subcategory, class: 'no-overflow' })
      ),
      {
        idPath: 'name',
        virtual: {
          height: 30,
          rowChunkSize: 3,
        },
        filter: (emojis, config) => {
          let { needle, sort } = config
          needle = needle.trim().toLocaleLowerCase()
          if (needle) {
            emojis = emojis.filter(emoji => `${emoji.name} ${emoji.category} ${emoji.subcategory}`.toLocaleLowerCase().includes(needle))
          }
          return config.sort === 'default' ? emojis : emojis.sort((a, b) => a[config.sort] > b[config.sort] ? 1 : -1)
        },
        needle: filterListExample.config
      }
    )
  )
)
```

## List Utilities

Suppose you have used the a list binding to bind an array of objects
to a `<ul>`. So the DOM hierarchy looks something like this:

    <ul>  <-- array is bound to this element
      <template>
        <li>
          <span>...</span>
        </li>
      </template>
      <li>  <-- bound to array[0]
        <span>...</span>
      </li>
      <li>  <-- bound to array[1]
        <span>...</span>
      </li>
      ...
    </ul>

### `getListBinding(element: Element): ListBinding | undefined`

This gets the ListBinding object managing the bound list contained on the provided
element (if any). In the example above, you could call it on the `<ul>` and you'd
get back a `ListBinding` instance that contains all kinds of juicy information.

### `getListItem(element: Element): any`

Gets you the array item bound to the list instance containing the element (if any).

You could call this on an `<li>` element or a any element inside it and get back
the array item bound to the `<li>`.

### `getListInstance(element: Element): { element: Element, item: any } | undefined`

This returns both the root element bound to the array item, and the array item itself.

Again, you could call this on an `<li>` or its contents.

### `deleteListItem(element: Element): boolean`

If the element is part of a list instance bound to an array, this splices bound item out of the array
(and updates the rendered list).

If you call this on an `<li>` or something inside it, this will splice the bound
array item out of the array and then triggers an update the bound list.

> `deleteListItem()` requires that the list binding specifies
> a valid `idPath`, or it will throw an error (and fail).

## Window Scroll Container (Experimental)

By default, virtualized lists scroll within their container element. For infinite-scroll
feeds or full-page lists, you can use the window as the scroll container instead by
setting `scrollContainer: 'window'` in the virtual options:

    bindList: {
      value: feedItems,
      idPath: 'id',
      virtual: {
        height: 120,
        scrollContainer: 'window'
      }
    }

With `scrollContainer: 'window'`, the list virtualizes based on the window's scroll
position and viewport height, rather than the element's own scroll position. The list
calculates which items are visible by comparing the element's position (via
`getBoundingClientRect()`) against the window's scroll position and inner height.

This is ideal for:
- Social media-style feeds
- Search results pages
- Any full-page scrolling list where the list is part of the main document flow

**Important**: The list element should not be inside a separately scrollable container
when using window scroll. The element can be positioned anywhere on the page - the
virtualization will correctly account for content above the list.
*/
import { settings } from './settings'
import { resizeObserver } from './dom'
import { throttle } from './throttle'
import { xin } from './xin'
import {
  cloneWithBindings,
  elementToBindings,
  BOUND_SELECTOR,
  DataBinding,
  tosiValue,
  tosiPath,
  LIST_BINDING_REF,
  LIST_INSTANCE_REF,
  registerArrayIdPath,
} from './metadata'
import { XinObject, ListBindingOptions } from './xin-types'
import { Listener } from './path-listener'

const SLICE_INTERVAL_MS = 16 // 60fps
const FILTER_INTERVAL_MS = 100 // 10fps

interface VirtualListSlice {
  items: any[]
  firstItem: number
  lastItem: number
  topBuffer: number
  bottomBuffer: number
}

function updateRelativeBindings(element: Element, path: string): void {
  const boundElements = Array.from(element.querySelectorAll(BOUND_SELECTOR))
  if (element.matches(BOUND_SELECTOR)) {
    boundElements.unshift(element)
  }
  for (const boundElement of boundElements) {
    const bindings = elementToBindings.get(boundElement) as DataBinding[]
    for (const binding of bindings) {
      if (binding.path.startsWith('^')) {
        binding.path = `${path}${binding.path.substring(1)}`
      }
      if (binding.binding.toDOM != null) {
        binding.binding.toDOM(boundElement as Element, xin[binding.path])
      }
    }
  }
}

export class ListBinding {
  boundElement: Element
  listTop: HTMLElement
  listBottom: HTMLElement
  template: Element
  options: ListBindingOptions
  itemToElement: WeakMap<XinObject, Element>
  array: any[] = []
  private readonly _update?: VoidFunction
  private _previousSlice?: VirtualListSlice
  static filterBoundObservers = new WeakMap<Element, Listener>()

  constructor(
    boundElement: Element,
    value: any[],
    options: ListBindingOptions = {}
  ) {
    this.boundElement = boundElement
    this.itemToElement = new WeakMap()

    // Register idPath for this array to enable id-path touch synthesis
    if (options.idPath != null) {
      const arrayPath = tosiPath(value)
      if (arrayPath != null) {
        registerArrayIdPath(arrayPath, options.idPath)
      }
    }

    if (boundElement.children.length !== 1) {
      throw new Error(
        'ListBinding expects an element with exactly one child element'
      )
    }
    if (boundElement.children[0] instanceof HTMLTemplateElement) {
      const template = boundElement.children[0]
      if (template.content.children.length !== 1) {
        throw new Error(
          'ListBinding expects a template with exactly one child element'
        )
      }
      this.template = cloneWithBindings(
        template.content.children[0]
      ) as HTMLElement
    } else {
      this.template = boundElement.children[0] as HTMLElement
      this.template.remove()
    }
    this.options = options
    this.listTop = document.createElement('div')
    this.listBottom = document.createElement('div')
    this.listTop.classList.add('virtual-list-padding')
    this.listBottom.classList.add('virtual-list-padding')
    this.boundElement.append(this.listTop)
    this.boundElement.append(this.listBottom)
    if (options.virtual != null) {
      resizeObserver.observe(this.boundElement)
      this._update = throttle(() => {
        this.update(this.array, true)
      }, SLICE_INTERVAL_MS)
      // Always listen to element resize (from ResizeObserver)
      this.boundElement.addEventListener('resize', this._update)
      if (options.virtual.scrollContainer === 'window') {
        window.addEventListener('scroll', this._update)
        window.addEventListener('resize', this._update)
      } else {
        this.boundElement.addEventListener('scroll', this._update)
      }
    }
  }

  private visibleSlice(): VirtualListSlice {
    const { virtual, hiddenProp, visibleProp } = this.options
    let visibleArray = this.array
    if (hiddenProp !== undefined) {
      visibleArray = visibleArray.filter((item) => item[hiddenProp] !== true)
    }
    if (visibleProp !== undefined) {
      visibleArray = visibleArray.filter((item) => item[visibleProp] === true)
    }
    if (this.options.filter && this.needle !== undefined) {
      visibleArray = this.options.filter(visibleArray, this.needle)
    }
    let firstItem = 0
    let lastItem = visibleArray.length - 1
    let topBuffer = 0
    let bottomBuffer = 0

    if (virtual != null && this.boundElement instanceof HTMLElement) {
      const width = this.boundElement.offsetWidth
      const useWindowScroll = virtual.scrollContainer === 'window'

      // Viewport height and scroll position
      let viewportHeight: number
      let scrollTop: number

      if (useWindowScroll) {
        viewportHeight = window.innerHeight
        const elementRect = this.boundElement.getBoundingClientRect()
        // scrollTop is how far into the list we've scrolled
        // negative elementRect.top means we've scrolled past the top of the element
        scrollTop = Math.max(0, -elementRect.top)
      } else {
        viewportHeight = this.boundElement.offsetHeight
        scrollTop = this.boundElement.scrollTop
      }

      // Always recalculate visibleColumns from current width so resizing
      // a previously-dimensionless container produces the correct slice
      const visibleColumns =
        virtual.width != null
          ? Math.max(1, Math.floor(width / virtual.width))
          : virtual.visibleColumns ?? 1
      const visibleRows =
        Math.ceil(viewportHeight / virtual.height) + (virtual.rowChunkSize || 1)
      const totalRows = Math.ceil(visibleArray.length / visibleColumns)
      const visibleItems = visibleColumns * visibleRows
      let topRow = Math.floor(scrollTop / virtual.height)
      if (topRow > totalRows - visibleRows + 1) {
        topRow = Math.max(0, totalRows - visibleRows + 1)
      }
      if (virtual.rowChunkSize) {
        topRow -= topRow % virtual.rowChunkSize
      }

      firstItem = topRow * visibleColumns
      lastItem = firstItem + visibleItems - 1

      topBuffer = topRow * virtual.height
      bottomBuffer = Math.max(
        (totalRows - visibleRows) * virtual.height - topBuffer,
        0
      )
    }

    return {
      items: visibleArray,
      firstItem,
      lastItem,
      topBuffer,
      bottomBuffer,
    }
  }

  private needle?: any
  filter = throttle((needle: any) => {
    if (this.needle !== needle) {
      this.needle = needle
      this.update(this.array)
    }
  }, FILTER_INTERVAL_MS)

  update(array?: any[], isSlice?: boolean) {
    if (array == null) {
      array = []
    }
    this.array = array

    const { hiddenProp, visibleProp } = this.options
    const arrayPath: string = tosiPath(array) as string

    const slice = this.visibleSlice()
    this.boundElement.classList.toggle(
      '-xin-empty-list',
      slice.items.length === 0
    )
    const previousSlice = this._previousSlice
    const { firstItem, lastItem, topBuffer, bottomBuffer } = slice
    if (
      hiddenProp === undefined &&
      visibleProp === undefined &&
      isSlice === true &&
      previousSlice != null &&
      firstItem === previousSlice.firstItem &&
      lastItem === previousSlice.lastItem &&
      topBuffer === previousSlice.topBuffer &&
      bottomBuffer === previousSlice.bottomBuffer
    ) {
      return
    }
    this._previousSlice = slice

    let removed = 0
    let moved = 0
    let created = 0

    for (const element of Array.from(this.boundElement.children)) {
      if (element === this.listTop || element === this.listBottom) {
        continue
      }
      // @ts-expect-error if it's there it's there
      const proxy = element[LIST_INSTANCE_REF]
      if (proxy == null) {
        element.remove()
      } else {
        const idx = slice.items.indexOf(proxy)
        if (idx < firstItem || idx > lastItem) {
          element.remove()
          this.itemToElement.delete(proxy)
          removed++
        }
      }
    }

    this.listTop.style.height = String(topBuffer) + 'px'
    this.listBottom.style.height = String(bottomBuffer) + 'px'

    // build a complete new set of elements in the right order
    const elements: Element[] = []
    const { idPath } = this.options
    for (let i = firstItem; i <= lastItem; i++) {
      const item = slice.items[i]
      if (item === undefined) {
        continue
      }
      let element = this.itemToElement.get(tosiValue(item))
      if (element == null) {
        created++
        element = cloneWithBindings(this.template) as HTMLElement
        if (typeof item === 'object') {
          this.itemToElement.set(tosiValue(item), element)
          // @ts-expect-error if it's there it's there
          element[LIST_INSTANCE_REF] = tosiValue(item)
        }
        this.boundElement.insertBefore(element, this.listBottom)
        if (idPath != null) {
          const idValue = item[idPath] as string
          const itemPath = `${arrayPath}[${idPath}=${idValue}]`
          updateRelativeBindings(element, itemPath)
        } else {
          const itemPath = `${arrayPath}[${i}]`
          updateRelativeBindings(element, itemPath)
        }
      }
      elements.push(element)
    }

    // make sure all the elements are in the DOM and in the correct location
    let insertionPoint: Element | null = null
    for (const element of elements) {
      if (element.previousElementSibling !== insertionPoint) {
        moved++
        if (insertionPoint?.nextElementSibling != null) {
          this.boundElement.insertBefore(
            element,
            insertionPoint.nextElementSibling
          )
        } else {
          this.boundElement.insertBefore(element, this.listBottom)
        }
      }
      insertionPoint = element
    }

    if (settings.perf) {
      console.log(arrayPath, 'updated', { removed, created, moved })
    }
  }
}

interface ListBoundElement extends Element {
  [LIST_BINDING_REF]?: ListBinding
}

export const getListBinding = (
  boundElement: ListBoundElement,
  value?: any[],
  options?: ListBindingOptions
): ListBinding | undefined => {
  let listBinding = boundElement[LIST_BINDING_REF]
  if (value && listBinding === undefined) {
    listBinding = new ListBinding(boundElement, value, options)
    boundElement[LIST_BINDING_REF] = listBinding
  }
  return listBinding
}

type PossiblyBoundElement = Element & {
  [LIST_BINDING_REF]?: ListBinding
  [LIST_INSTANCE_REF]?: ListBinding
}

export const getListInstance = (
  element: Element
): { element: Element; item: any } | undefined => {
  let item: any
  while (
    !(item = (element as PossiblyBoundElement)[LIST_INSTANCE_REF]) &&
    element &&
    element.parentElement
  ) {
    element = element.parentElement
  }
  return item ? { element, item } : undefined
}

export const getListItem = (element: Element): any => {
  const instance = getListInstance(element)
  return instance ? instance.item : undefined
}

export const deleteListItem = (element: Element): boolean => {
  const instance = getListInstance(element)
  if (!instance) {
    console.error(
      'deleteListItem failed, element is not part of a list instance',
      element
    )
    return false
  }
  const binding = getListBinding(instance.element.parentElement!)!
  if (!binding.options.idPath) {
    console.error(
      'deleteListItem failed, list binding has no idPath',
      element.parentElement,
      binding
    )
    return false
  }
  const index = binding.array.indexOf(instance.item)
  if (index > -1) {
    binding.array.splice(index, 1)
    return true
  }
  return false
}
