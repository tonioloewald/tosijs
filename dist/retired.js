console.warn(
  'tosijs: "tosijs/debug" and "tosijs/safe" are retired. They were experimental ' +
    'and performed no runtime checks, so this is the ordinary library: import ' +
    '"tosijs" instead. These subpaths are removed in 2.0.'
)
export * from './module.js'
