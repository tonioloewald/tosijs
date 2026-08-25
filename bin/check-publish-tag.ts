#!/usr/bin/env bun
/**
 * Refuse to publish a PRERELEASE onto npm's `latest` tag.
 *
 * `npm publish` defaults to `latest`. Forget `--tag rc` on a prerelease and
 * every `npm i tosijs` starts serving it — which is precisely what happened
 * with 1.8.0-rc.2: the publish itself was fine, the tag routing was not, and
 * `latest` pointed at a release candidate until someone noticed.
 *
 * The signal is reliable: npm sets `npm_config_tag` in the environment when
 * `--tag` is passed and leaves it undefined otherwise (verified against
 * `npm publish --dry-run` both ways). So this can distinguish "forgot the
 * flag" from "deliberately publishing a prerelease as latest", which is a
 * thing someone might genuinely want and should have to say out loud.
 *
 * Wired as `prepublishOnly`, so it runs for `npm publish` and NOT for
 * `npm pack`, `bun pm pack`, or an install — the narrowest hook that covers
 * the mistake.
 */
import pkg from '../package.json'

const version: string = pkg.version
const isPrerelease = version.includes('-')
const tag = process.env.npm_config_tag

if (!isPrerelease) {
  // a stable release going to `latest` is the ordinary case
  process.exit(0)
}

if (tag == null || tag === 'latest') {
  const channel = version.split('-')[1]?.split('.')[0] ?? 'next'
  console.error(
    `\n  REFUSING TO PUBLISH: ${version} is a prerelease and would become ` +
      `\`latest\`.\n\n` +
      `  npm publish defaults to \`latest\`, so every \`npm i ${pkg.name}\` ` +
      `would start\n  serving a release candidate.\n\n` +
      `  Did you mean:\n\n` +
      `      npm publish --tag ${channel}\n\n` +
      `  If you really do want this prerelease on \`latest\`, say so ` +
      `explicitly:\n\n` +
      `      npm publish --tag latest\n\n` +
      `  (If it already happened, it is fixable without unpublishing:\n` +
      `      npm dist-tag add ${pkg.name}@${version} ${channel}\n` +
      `      npm dist-tag add ${pkg.name}@<last-stable> latest)\n`
  )
  process.exit(1)
}

console.log(`publish tag: ${version} → \`${tag}\` (prerelease, not latest)`)
