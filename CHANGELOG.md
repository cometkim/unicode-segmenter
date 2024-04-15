# unicode-segmenter

## 0.1.6

### Patch Changes

- 18c7f44: Fix breaks on Unicode extended characters

## 0.1.5

### Patch Changes

- 168319f: Reduce the production bundle size

  Previously I did unescape `"\u{1F680}"` to `"🚀"` in the Unicode table. Since extra characters are required to escape, it reduces the output size.

  However, escape sequences compress better. So leaving the build output as is makes more sense for production.

## 0.1.4

### Patch Changes

- 0baf327: Fix CommonJS entries

  CommonJS entries had wrong import paths to ESM, now fixed.
  I really need to work on [espub](https://github.com/cometkim/espub) 😅

## 0.1.3

### Patch Changes

- b65ae23: Skip invariant state checks
- 5b127e8: Fix error on empty string
- 4dfce08: Fix codepoint boundary check
- 4e34e25: Fix missing surrogate boundary check

## 0.1.2

### Patch Changes

- 973d645: Add index entry

  And good old `"main"` entry

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
