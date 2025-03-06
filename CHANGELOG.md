# unicode-segmenter

## 0.12.0

### Minor Changes

- 21cd789: Removed deprecated APIs

  - `searchGrapheme` in `unicode-segmenter/grapheme`
  - `takeChar` and `takeCodePoint` in `unicode-segmenter/utils`

  Which are used internally before, but never from outside.

- 483d258: Reduced bundle size, while keeping the best perf

  Some details:

  - Refactored to use the same code path internally as possible.
  - Removed pre-computed jump table, the optimization were compensated for by other perf improvements.
  - Previous array layout to avoid accidental de-opt turned out to be overkill. The regular tuple array is well optimized, so I fall back to using good old plain binary search.
  - Some experiments like new encoding and eytzinger layout for more aggressive improvements, but no success.

## 0.11.3

### Patch Changes

- a5f486f: Fix bloat in the NPM package.

  `package.tgz` was mostly bloated by CommonJS interop and sourcemap.

  However, sourcemap isn't necessary here as it uses sources as is,
  and the CommonJS shouldn't be different.

  Now fixed by simpler transpilation for CommoJS entries, and removed sourcemap files.
  Also removed inaccessible entries.

  So the unpacked total package size has been **down to 135 KB from 250 KB**

  Note: Node.js v22 will stabilize `require(ESM)`, which will allow CommonJS projects to use this package without having to maintain separate entries. I'm very excited about that, and looking forward to it becoming more "common". The first major release may consider ending support for CommonJS entries and TypeScript's `"Node"` resolution.

## 0.11.2

### Patch Changes

- 94ed937: Improved perf and bundle size a bit

  It seems using `TypedArray` isn't helpful,
  and deref many prototypes may cause deopt.

  `Array` is good enough while it ensures it's packed.

- de71269: Update `Intl` type definition

## 0.11.1

### Patch Changes

- 9d688d8: grapheme: rename `countGrapheme()` to `countGraphemes()`. existing name is deprecated alias.
- be49399: grapheme: Add `splitGraphemes()` utility
- 5e86659: grapheme: add more detail to API JSDoc

## 0.11.0

### Minor Changes

- ffb41fb: Code size is signaficantly reduced, minified JS now works in half

  There are also some performance improvements.
  Not that much, but getting improvement on size without giving it up is a huge win.

  - Compress Unicode data more in Base36

  - Changed the internal representation into TypedArray to improve its access pattern.

  - Shrank the grapheme lookup table size.
    This does not impact performance except for some edges like Hindi and Demonic, but it does reduce the bundle size.

- 9e0feca: Update to Unicode® 16.0.0

## 0.10.1

### Patch Changes

- 3665cf7: Fix Hindi text segmentation

## 0.10.0

### Minor Changes

- 73f5e6b: Significantly reduced bundle size by compressing data table. So the grapheme segmentation library is only takes 6.6kB (gzip) or 4.4kB (brotli)!

### Patch Changes

- b045320: Fix `isSMP`, and add more plane utils (`isSIP`, `isTIP`, `isSSP`)

## 0.9.2

### Patch Changes

- 447b484: Fix polyfill to do not override existing, and also to be assigned as non-enumerable

## 0.9.1

### Patch Changes

- 04fe2fc: Fix sourcemap reference error

  - Include missing sourcemap files for transformed cjs entries
  - Remove unnecessary transforms for esm entries and remove source map reference

## 0.9.0

### Minor Changes

- 657e31a: semi-breaking: removed `_cat` from grapheme cluster segments because it was useless

  Instead, added `_catBegin` and `_catEnd` as beginning/end category of segments, which are possibly useful to infer applied boundary rules.

## 0.8.0

### Minor Changes

- f5ec709: Deprecated `isEmoji(cp)` in favor of `isExtendedPictogrphic(cp)`.

  There are no differences, but it was confused with the `\p{Emoji}` Unicode property.

  (Note: `\p{Emoji}` is not useful in actual use cases, [see](https://stackoverflow.com/questions/70401560/what-is-the-difference-between-emoji-presentation-and-extended-pictographic))

### Patch Changes

- 5bf4d29: Fix the TypeScript definition for GraphemeCategory enum

## 0.7.0

### Minor Changes

- f1a43ff: Cleanup mixed use of `takeCodePoint` and `String.prototype.codePointAt`
  - `grapheme`: Use `String.prototype.codePointAt`
  - `grapheme`: Optimize character length checking, also reduce the size a bit
  - `utils`: Add `isBMP` and `isSMP` util to check a codepoint number is being BMP(Basic Multilingual Plane) range
  - `utils`: Deprecated `takeCodePoint` and `takeChar` in favor of ES6 `String.prototype.codePointAt` and `String.fromCodePoint`
  - `utils`: `takeChar` is no longer depends on `String.fromCodePoint` internally

## 0.6.1

### Patch Changes

- 03e121c: Optimize grapheme cluster boundary check

## 0.6.0

### Minor Changes

- 04455e0: Implement [GB9c rule](https://www.unicode.org/reports/tr29/#GB9c) from Unicode® Standard Annex \#29
- f9d3dd1: Hide the internal fields of the Intl adapter to prevent auto-completion

## 0.5.0

### Minor Changes

- 06159a4: Fix ESM module resolution, and make ESM-first (still support CommonJS by condition)

## 0.4.0

### Minor Changes

- e2c9e1d: Optimize perf again 🔥

  It can be still getting faster, why not?

  Through seriously thoughtful micro-optimizations, it has achieved performance improvements of up to ~30% (404ns -> 310ns) in the previously used simple emoji joiner test.

  Now it use more realistic benchmark with various types of input text. In most cases, `unicode-segmenter` is 7~15 times faster than other competing libraries.

  For example, here a Tweet-like text ChatGPT generated:

  ```
  🚀 새로운 유니코드 분할기 라이브러리 \'unicode-segmenter\'를 소개합니다! 🔍 각종 언어의 문자를 정확하게 구분해주는 강력한 도구입니다. Check it out! 👉 [https://github.com/cometkim/unicode-segmenter] #Unicode #Programming 🌐
  ```

  And the result then:

  ```
  cpu: Apple M1 Pro
  runtime: node v21.7.1 (arm64-darwin)

                         time (avg)             (min … max)       p75       p99      p999
  --------------------------------------------------------- -----------------------------
  unicode-segmenter   7'850 ns/iter   (7'753 ns … 8'122 ns)  7'877 ns  8'079 ns  8'122 ns
  Intl.Segmenter     60'581 ns/iter    (57'916 ns … 405 µs) 59'167 ns 66'458 ns    358 µs
  graphemer          66'303 ns/iter    (64'708 ns … 287 µs) 65'500 ns 73'459 ns    206 µs
  grapheme-splitter     146 µs/iter       (143 µs … 466 µs)    145 µs    157 µs    397 µs

  summary
    unicode-segmenter
     7.72x faster than Intl.Segmenter
     8.45x faster than graphemer
     18.6x faster than grapheme-splitter
  ```

- ab6787b: Make the Intl adapter's type definitions compatible with the original
- f974448: - Rename `searchGrapheme` to `searchGraphemeCategory`, and deprecated old one.
  - Rename `Segmenter` definitions from grapheme module to `GraphemeCategory`.
  - Remove `SearchResult<T>`, and `GraphemeSearchResult` defnitions which are identical to `CategorizedUnicodeRange<T>`.
  - Improve JSDoc comments to be more informative.
- dc62381: Add `takeCodePoint` util to avoid extra `String.codePointAt()`

### Patch Changes

- 3ea5a2d: Optimized initial parsing time via compacting tables into JSON

  See https://v8.dev/blog/cost-of-javascript-2019#json
  and https://youtu.be/ff4fgQxPaO0

- 16d2028: - Fix `Intl.Segmenter` adapter type definitions to be 100% compatible with tslib
  - Implemented `Intl.Segmenter.prototype.resolvedOptions`.\
     But since the locale matcher is environment-specific,
    the adapter returns input locale as-is, or fallback to `en`.

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
