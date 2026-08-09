#!/usr/bin/env node
/**
 * The tosijs scaffolder — `bunx tosijs create …` / `npx tosijs create …`
 *
 *   bunx tosijs create app <name>            a runnable app (bun index.html)
 *   bunx tosijs create component <tag>       a component, BLUEPRINT form (default)
 *   bunx tosijs create component <tag> --bare  …plain Component subclass form
 *   bunx tosijs create blueprint <tag>       a publishable blueprint package
 *
 * Everything scaffolded is agent-ready: components are born with a
 * `contract` (description + value schema + parts map + a declared test),
 * so they self-describe on the agent surface and self-verify under
 * exerciseComponent from their first minute. The blueprint form is the
 * default deliberately: a blueprint is consumable directly from markup
 * (`<tosi-blueprint tag src>`) with no build step on the consumer's side —
 * and tosijs still hydrates blueprints built before the xinjs→tosijs
 * rename, which is the compatibility bar new ones inherit.
 *
 * Node-compatible on purpose (fs/path/process only): npx runs this under
 * node, bunx under bun; both must work.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { version } from '../src/version'

const [command, kind, rawName, ...flags] = process.argv.slice(2)

function fail(message: string): never {
  console.error(`tosijs: ${message}`)
  console.error("try: bunx tosijs help")
  process.exit(1)
}

function help(): void {
  console.log(`tosijs ${version} — scaffolder

  bunx tosijs create app <name>              app project (bun index.html to run)
  bunx tosijs create component <tag>         component, blueprint form (default)
  bunx tosijs create component <tag> --bare  component, plain class form
  bunx tosijs create blueprint <tag>         publishable blueprint package

Component/blueprint tags need a dash (custom-element rule): my-thing, not thing.
Everything scaffolded carries a contract — agent-ready, self-verifying.`)
}

const kebab = (name: string): boolean => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name)
const className = (tag: string): string =>
  tag.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase())
const camel = (tag: string): string => {
  const cls = className(tag)
  return cls[0].toLowerCase() + cls.slice(1)
}

function write(path: string, content: string): void {
  writeFileSync(path, content)
  console.log(`  ${path}`)
}

/** the component body shared by every scaffold — a counter, because it
 * exercises value, parts, a handler, and a declared test in ~30 lines */
function contractSource(tag: string): string {
  return `export const contract = {
  description: '${tag}: counts button presses — replace with what YOURS does',
  value: { type: 'integer', examples: [0, 3] },
  parts: { readout: 'span', increment: 'button' },
  tests: [
    {
      name: 'pressing increments and renders',
      steps: [
        { set: { value: 2 } },
        { click: 'increment' },
        { expect: { value: 3, text: { readout: '3' } } },
      ],
    },
  ],
} as const satisfies ComponentMap`
}

function componentBody(): string {
  return `    value = 0

    content = ({ span, button }: any) => [
      span({ part: 'readout' }),
      button(
        {
          part: 'increment',
          onClick: () => {
            this.value = Number(this.value) + 1
          },
        },
        '+1'
      ),
    ]

    render() {
      this.parts.readout.textContent = String(this.value)
    }`
}

function blueprintFormSource(tag: string): string {
  const cls = className(tag)
  return `/**
 * ${tag} — scaffolded by \`tosijs create component\` (blueprint form).
 *
 * Consume WITHOUT a build step, straight from markup:
 *
 *     <tosi-blueprint tag="${tag}" src="./path/to/${tag}.js"></tosi-blueprint>
 *     <${tag}></${tag}>
 *
 * …or in code: \`makeComponent('${tag}', blueprint)\`. The type-only tosijs
 * import erases at build time — a bundled blueprint has ZERO dependencies
 * (everything arrives via the factory argument at hydration).
 *
 * The contract makes it agent-ready and self-verifying:
 * \`exerciseComponent(element)\` runs the declared test wherever it mounts.
 */
import type { TosiBlueprint, ComponentMap } from 'tosijs'

${contractSource(tag)}

const blueprint: TosiBlueprint = (tag, { Component }) => {
  class ${cls} extends (Component as any) {
    static contract = contract

${componentBody()}
  }
  return { type: ${cls} as any, contract }
}

export default blueprint
`
}

function bareFormSource(tag: string): string {
  const cls = className(tag)
  return `/**
 * ${tag} — scaffolded by \`tosijs create component --bare\` (plain class form).
 *
 *     import { ${camel(tag)} } from './${tag}'
 *     document.body.append(${camel(tag)}())
 *
 * The contract makes it agent-ready and self-verifying:
 * \`exerciseComponent(element)\` runs the declared test wherever it mounts.
 * (Prefer the blueprint form unless you have a reason: blueprints are
 * consumable directly from markup with no build step on the consumer side.)
 */
import { Component, type ComponentMap } from 'tosijs'

${contractSource(tag)}

export class ${cls} extends Component<typeof contract> {
  static preferredTagName = '${tag}'
  static contract = contract

${componentBody()}
}

export const ${camel(tag)} = ${cls}.elementCreator()
`
}

function createComponent(tag: string, bare: boolean): void {
  if (!tag) fail('component needs a tag: bunx tosijs create component my-thing')
  if (!kebab(tag) || !tag.includes('-')) {
    fail(
      `"${tag}" is not a valid custom-element tag (kebab-case with a dash) — try "tosi-${tag}"`
    )
  }
  const file = `${tag}.ts`
  if (existsSync(file)) fail(`${file} already exists`)
  console.log(`component ${tag} (${bare ? 'bare class' : 'blueprint'} form):`)
  write(file, bare ? bareFormSource(tag) : blueprintFormSource(tag))
  console.log(
    bare
      ? `\nimport { ${camel(tag)} } from './${tag}' and append ${camel(tag)}()`
      : `\nconsume from markup:\n  <tosi-blueprint tag="${tag}" src="./${file.replace(/\.ts$/, '.js')}"></tosi-blueprint>\n  <${tag}></${tag}>\nor in code: makeComponent('${tag}', blueprint)`
  )
}

function createBlueprint(tag: string): void {
  if (!tag) fail('blueprint needs a tag: bunx tosijs create blueprint my-thing')
  if (!kebab(tag) || !tag.includes('-')) {
    fail(
      `"${tag}" is not a valid custom-element tag (kebab-case with a dash) — try "tosi-${tag}"`
    )
  }
  if (existsSync(tag)) fail(`directory ${tag}/ already exists`)
  mkdirSync(join(tag, 'src'), { recursive: true })
  console.log(`blueprint package ${tag}/:`)
  write(
    join(tag, 'package.json'),
    JSON.stringify(
      {
        name: tag,
        version: '0.1.0',
        description: `${tag} — a tosijs blueprint (consumable directly from markup)`,
        type: 'module',
        module: 'dist/index.js',
        files: ['dist'],
        scripts: {
          build: 'bun build src/index.ts --outdir dist --format esm',
          start: 'bun run build && bun index.html',
          prepublishOnly: 'bun run build',
        },
        devDependencies: { tosijs: `^${version}` },
      },
      null,
      2
    ) + '\n'
  )
  write(join(tag, 'src', 'index.ts'), blueprintFormSource(tag))
  write(
    join(tag, 'index.html'),
    `<!DOCTYPE html>
<title>${tag}</title>
<script type="module">
  // registers <tosi-blueprint> (and still hydrates pre-rename xinjs blueprints)
  import 'https://cdn.jsdelivr.net/npm/tosijs/dist/module.js'
</script>
<h1>${tag}</h1>
<tosi-blueprint tag="${tag}" src="./dist/index.js"></tosi-blueprint>
<${tag}></${tag}>
`
  )
  write(
    join(tag, 'README.md'),
    `# ${tag}

A [tosijs](https://tosijs.net) blueprint: a component consumers load
**directly from markup** — no build step, no framework install on their side:

    <script type="module">
      import 'https://cdn.jsdelivr.net/npm/tosijs/dist/module.js'
    </script>
    <tosi-blueprint tag="${tag}" src="https://cdn.jsdelivr.net/npm/${tag}/dist/index.js"></tosi-blueprint>
    <${tag}></${tag}>

The bundle has zero dependencies (tosijs arrives via the hydration factory),
and the component carries a **contract** — it self-describes on the agent
surface and self-verifies via \`exerciseComponent()\`.

## develop

    bun start          # build + demo page

## publish

    npm publish        # prepublishOnly builds dist/
`
  )
  console.log(`\ncd ${tag} && bun start`)
}

function createApp(name: string): void {
  if (!name) fail('app needs a name: bunx tosijs create app my-app')
  if (!kebab(name)) fail(`"${name}" is not kebab-case`)
  if (existsSync(name)) fail(`directory ${name}/ already exists`)
  const tag = name.includes('-') ? name : `${name}-counter`
  mkdirSync(join(name, 'src', 'components'), { recursive: true })
  console.log(`app ${name}/:`)
  write(
    join(name, 'package.json'),
    JSON.stringify(
      {
        name,
        version: '0.0.1',
        private: true,
        type: 'module',
        scripts: { start: 'bun index.html' },
        dependencies: { tosijs: `^${version}` },
      },
      null,
      2
    ) + '\n'
  )
  write(
    join(name, 'index.html'),
    `<!DOCTYPE html>
<title>${name}</title>
<main id="app"></main>
<script type="module" src="./src/app.ts"></script>
`
  )
  write(join(name, 'src', 'components', `${tag}.ts`), blueprintFormSource(tag))
  write(
    join(name, 'src', 'app.ts'),
    `import { tosi, elements, makeComponent, enableAgentInterface } from 'tosijs'
import counterBlueprint from './components/${tag}'

const { app } = tosi({
  app: {
    greeting: 'Hello from ${name}',
  },
})

const { creator: ${camel(tag)} } = await makeComponent('${tag}', counterBlueprint)

const { h1, p } = elements
document.querySelector('#app')!.append(
  h1({ textContent: app.greeting }),
  p('This component was born with a contract — open the console and explore:'),
  ${camel(tag)}()
)

// dev mode: the whole app is on the map (tosiAgent in the console; auto-
// registers WebMCP tools where the browser provides a host). For production,
// declare what you expose: enableAgentInterface({ expose: { roots, actions } })
enableAgentInterface()
`
  )
  write(
    join(name, 'README.md'),
    `# ${name}

Scaffolded by \`bunx tosijs create app\`.

    bun install
    bun start          # bun's dev server, hot reload, https://localhost:3000

Open the console: \`tosiAgent.describe()\` is your app's live map — state,
wiring, actions. The scaffolded component carries a contract, so it
self-describes there and self-verifies via \`exerciseComponent()\`.
`
  )
  console.log(`\ncd ${name} && bun install && bun start`)
}

if (command === 'help' || command === '--help' || command === '-h' || command == null) {
  help()
} else if (command === 'version' || command === '--version' || command === '-v') {
  console.log(version)
} else if (command === 'create') {
  const bare = flags.includes('--bare') || rawName === '--bare'
  const name = rawName === '--bare' ? flags.find((f) => f !== '--bare') ?? '' : rawName
  if (kind === 'app') createApp(name)
  else if (kind === 'component') createComponent(name, bare)
  else if (kind === 'blueprint') createBlueprint(name)
  else fail(`unknown kind "${kind}" — app, component, or blueprint`)
} else {
  fail(`unknown command "${command}"`)
}
