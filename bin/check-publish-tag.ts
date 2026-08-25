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

const channel = version.split('-')[1]?.split('.')[0] ?? 'next'

// WE CAN ONLY ENFORCE WHAT WE CAN OBSERVE.
//
// The guard reads `npm_config_tag`, which npm sets when `--tag` is passed.
// bun does NOT set it — so under `bun publish --tag rc`, a perfectly correct
// command, this saw `undefined` and refused, advising the user to do the exact
// thing they had just done. That is worse than the hazard: it teaches people to
// reach for `--ignore-scripts`, which disables the guard permanently.
//
// So: hard-block only where the signal is trustworthy (npm). Under bun, say
// loudly what cannot be checked and let it through — the release checklist's
// "verify dist-tags after publishing" step is the backstop, and a reminder that
// occasionally repeats is cheaper than a gate that blocks correct work.
const agent = process.env.npm_config_user_agent ?? ''
const canReadTag = tag != null || !agent.includes('bun')

if (!canReadTag) {
  console.warn(
    `\n  ⚠️  ${version} is a PRERELEASE, and bun does not tell this hook which ` +
      `tag you passed.\n\n` +
      `  Publishing without \`--tag ${channel}\` puts a release candidate on ` +
      `\`latest\`,\n  where a bare install picks it up.\n\n` +
      `  Not blocking, because this cannot be distinguished from a correct ` +
      `command.\n  VERIFY IMMEDIATELY AFTER:\n\n` +
      `      npm view ${pkg.name} dist-tags\n\n` +
      `  and if \`latest\` moved when you did not mean it to:\n\n` +
      `      npm dist-tag add ${pkg.name}@${version} ${channel}\n` +
      `      npm dist-tag add ${pkg.name}@<last-stable> latest\n`
  )
  process.exit(0)
}

// THE ESCAPE HATCH CANNOT BE `--tag latest`, and this guard used to claim it
// was. npm exports `npm_config_*` only for NON-DEFAULT values, and `tag`'s
// default IS `latest` — so `npm publish --tag latest` leaves `npm_config_tag`
// unset, indistinguishable from omitting the flag, and hits the same refusal
// the message told you it would bypass. The only real escapes were
// `--ignore-scripts` or deleting the hook, both of which disable every publish
// gate permanently. "Verified both ways" had probed flag and no-flag; the
// third case the hatch depended on was never probed.
//
// So the deliberate override is an env var, which IS observable:
//   ALLOW_PRERELEASE_ON_LATEST=1 npm publish
const deliberateOverride = process.env.ALLOW_PRERELEASE_ON_LATEST === '1'

if (deliberateOverride) {
  console.warn(
    `\n  ⚠️  Publishing prerelease ${version} to \`latest\` deliberately ` +
      `(ALLOW_PRERELEASE_ON_LATEST=1).\n     A bare \`npm i ${pkg.name}\` will ` +
      `serve it.\n`
  )
  process.exit(0)
}

if (tag == null || tag === 'latest') {
  console.error(
    `\n  REFUSING TO PUBLISH: ${version} is a prerelease and would become ` +
      `\`latest\`.\n\n` +
      `  npm publish defaults to \`latest\`, so every \`npm i ${pkg.name}\` ` +
      `would start\n  serving a release candidate.\n\n` +
      `  Did you mean:\n\n` +
      `      npm publish --tag ${channel}\n\n` +
      `  If you really do want this prerelease on \`latest\`, note that\n` +
      `  \`--tag latest\` is INVISIBLE to this hook (npm only exports ` +
      `non-default\n  config, and \`latest\` is the default). Say it with an ` +
      `env var instead:\n\n` +
      `      ALLOW_PRERELEASE_ON_LATEST=1 npm publish\n\n` +
      `  (If it already happened, it is fixable without unpublishing:\n` +
      `      npm dist-tag add ${pkg.name}@${version} ${channel}\n` +
      `      npm dist-tag add ${pkg.name}@<last-stable> latest)\n`
  )
  process.exit(1)
}

console.log(`publish tag: ${version} → \`${tag}\` (prerelease, not latest)`)
