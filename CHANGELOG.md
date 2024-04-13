# unicode-segmenter

## 0.1.1

### Patch Changes

- 3b889e6: Fix TypeScript module resoluition out of `"Node16"` and `"NodeNext"`.

  Lifted up build artifact to root, so make module resolutions to be much polite with ohter modes.

- c68df9c: Override package's defualt type to `"commonjs"` in publishConfig

  Since it is still necessary for TypeScript projects.
  (See https://github.com/microsoft/TypeScript/issues/54523)

  It doesn't actually affects module resolution as we have explicit entries for each modules.
  Just workaround.

## 0.1.0

### Minor Changes

- ac4c9ba: Initial release
