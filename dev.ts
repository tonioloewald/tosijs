import * as path from 'path'
import { statSync } from 'fs'
import { watch } from 'chokidar'
import { $ } from 'bun'

declare const Bun: any

const PORT = 8018
const PROJECT_ROOT = import.meta.dir
const PUBLIC = path.resolve(PROJECT_ROOT, 'www')
const DIST = path.resolve(PROJECT_ROOT, 'dist')
const isSPA = true

function loadJsonSync<T>(filePath: string): T {
  try {
    const data = Bun.file(filePath).textSync()
    return JSON.parse(data) as T
  } catch (error) {
    throw new Error(`Failed to load JSON file: ${filePath}\n${error}`)
  }
}

const config = JSON.parse(
  await Bun.file(path.resolve(PROJECT_ROOT, 'package.json')).text()
)
await Bun.write('src/version.ts', `export const version = '${config.version}'`)

async function prebuild() {
  await $`rm -rf ${DIST}`
  await $`rm -rf ${PUBLIC}`
  await $`mkdir ${DIST}`
  await $`mkdir ${PUBLIC}`

  // await $`bun docs.js`
  await $`cp README.md ${PUBLIC}`
}

async function build() {
  console.time('build')
  let result

  await $`cp demo/static/* ${PUBLIC}`

  try {
    await $`bun tsc ./src/index.ts --declaration --emitDeclarationOnly --target esnext --outDir dist`
  } catch (e) {
    console.log('types created')
  }

  const targets = [
    { naming: 'index.iife.js', format: 'iife' },
    { naming: 'index.js', format: 'esm' },
    { naming: 'index.cjs', format: 'cjs' },
  ]
  for (const target of targets) {
    const { naming, format } = target
    let result = await Bun.build({
      entrypoints: ['./src/index.ts'],
      format,
      outdir: DIST,
      target: 'browser',
      sourcemap: 'linked',
      minify: true,
      naming,
    })
    if (!result.success) {
      console.error('demo build failed')
      for (const message of result.logs) {
        console.error(message)
      }
      return
    }
  }

  result = await Bun.build({
    entrypoints: ['./demo/index.ts'],
    outdir: PUBLIC,
    target: 'browser',
    sourcemap: 'linked',
    format: 'esm',
    minify: true,
  })
  if (!result.success) {
    console.error('dist build failed')
    for (const message of result.logs) {
      console.error(message)
    }
    return
  }

  console.timeEnd('build')
}

watch(['README.md', './src']).on('change', () => prebuild().then(build))
watch('./demo').on('change', build)

prebuild().then(build)

function serveFromDir(config: {
  directory: string
  path: string
}): Response | null {
  let basePath = path.join(config.directory, config.path)
  const suffixes = ['', '.html', 'index.html']

  for (const suffix of suffixes) {
    try {
      const pathWithSuffix = path.join(basePath, suffix)
      const stat = statSync(pathWithSuffix)
      if (stat && stat.isFile()) {
        return new Response(Bun.file(pathWithSuffix))
      }
    } catch (err) {}
  }

  return null
}

const server = Bun.serve({
  port: PORT,
  tls: {
    key: Bun.file('./tls/key.pem'),
    cert: Bun.file('./tls/certificate.pem'),
  },
  fetch(request) {
    let reqPath = new URL(request.url).pathname
    console.log(request.method, reqPath)
    if (reqPath === '/') reqPath = '/index.html'

    const buildResponse = serveFromDir({
      directory: PUBLIC,
      path: reqPath,
    })
    if (buildResponse) return buildResponse

    if (isSPA) {
      const spaResponse = serveFromDir({
        directory: PUBLIC,
        path: '/index.html',
      })
      console.log(spaResponse)
      if (spaResponse) return spaResponse
    }
    return new Response('File not found', {
      status: 404,
    })
  },
})

console.log(`Listening on https://localhost:${PORT}`)
