# unicode-segmenter

## 0.3.2

### Patch Changes

- e0b910d: Fix `{Extend}`+`{Extended_Pictographic}` sequence

  Counterexample:

  - '👩‍🦰👩‍👩‍👦‍👦🏳️‍🌈' -> 3 graphemes

  Reported from https://github.com/eslint/eslint/pull/18359

## 0.3.1

### Patch Changes

- 77af2ac: Fix CommonJS module resolutions

## 0.3.0

### Minor Changes

- c74c6a0: Expose `/utils` entry with a helpful API

  - `takeChar(input, cursor)`: take a utf8 character from given input by cursor

- c3ceaa5: Add `countGrapheme` utility
- 955814a: Expose some low-level APIs that might help other dependents
- 7592c3b: - New entries for Unicode's general and emoji properties

  ```js
  import {
    isLetter, // match w/ \p{L}
    isNumeric, // match w/ \p{N}
    isAlphabetic, // match w/ \p{Alphabetic}
    isAlphanumeric, // match w/ [\p{N}\p{Alphabetic}]
  } from "unicode-segmenter/general";

  import {
    isEmoji, // match w/ \p{Extended_Pictographic}
    isEmojiPresentation, // match w/ \p{Emoji_Presentation}
  } from "unicode-segmenter/emoji";
  ```

  - Grapheme segementer now yields matched category to `_cat` field.
    It will be useful when building custom matchers by the category

    e.g. custom emoji matcher:

    ```js
    function* matchEmoji(str) {
      for (let { index, segment, input, _cat } of graphemeSegments(str)) {
        if (_cat === GraphemeCategory.Extended_Pictographic) {
          yield { emoji: segment, index };
        }
      }
    }
    ```

- 7592c3b: Add more low-level utilities

  - `isHighSurrogate` check if a UTF-16 code in high surrogate
  - `isLowSurragate` check if a UTF-16 code in low surrogate
  - `surrogatePairToCodePoint` convert given surrogate pair to a Unicode code point

### Patch Changes

- 7592c3b: Correct some type definitions
- 900f959: Optimize perf again
- 3db955b: Fix edge cases around ZWJ

## 0.2.0

### Minor Changes

- 9938499: Getting 2x faster by optimizing hot path. Also with reduced bundle size

  By casting Unicode chars to u32 in advance, all internal operations become 32-bit integer operations.

  The previous version (v0.1.6) was

  - 2.47x faster than Intl.Segmenter
  - 2.68x faster than graphemer
  - 4.95x faster than grapheme-splitter

  Now it is

  - 5.04x faster than Intl.Segmenter
  - 5.52x faster than graphemer
  - 9.83x faster than grapheme-splitter

### Patch Changes

- b6824b5: Mark `sideEffects` on the polyfill bundle
- 7c68863: Reduce bundle size a bit by inlining internal constants, and removing unused insternal state.
- 9938499: Reduce bundle size a bit more
- f1c80b7: Publish sourcemaps

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
