# unicode-segmenter
[![NPM Package Version](https://img.shields.io/npm/v/unicode-segmenter)](https://npmjs.com/package/unicode-segmenter)
[![NPM Downloads](https://img.shields.io/npm/dw/unicode-segmenter)](https://npmjs.com/package/unicode-segmenter)
[![Integration](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml/badge.svg)](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/cometkim/unicode-segmenter/graph/badge.svg?token=3rA29JEH4J)](https://codecov.io/gh/cometkim/unicode-segmenter)
[![LICENSE - MIT](https://img.shields.io/github/license/cometkim/unicode-segmenter)](#license)

A lightweight implementation of [Unicode Text Segmentation (UAX \#29)](https://www.unicode.org/reports/tr29)

- **Zero-dependencies**: It doesn't bloat `node_modules` or the networks tab.

- **Excellent compatibility**: It works well on older browsers, edge runtimes, and embedded JavaScript runtimes like [Hermes] and [QuickJS].

- **Small bundle size**: It effectively compresses Unicode data and provides tree-shakeable format, allowing unnecessary codes to be eliminated.

- **Extreamly efficient**: It's carefully optimized for performance, making it the fastest one in the ecosystem—outperforming even the built-in `Intl.Segmenter`.

- **TypeScript**: It's fully type-checked, provides definitions with JSDoc.

- **ESM-first**: It natively supports ES Modules, also supports CommonJS too.

## Unicode® Version

Unicode® 15.1.0

Unicode® Standard Annex \#29 - [Revision 43](https://www.unicode.org/reports/tr29/tr29-43.html) (2023-08-16)

## APIs

There are several entries for text segmentation.

- [`unicode-segmenter/grapheme`](#export-unicode-segmentergrapheme): Segments and counts **extended grapheme clusters**
- [`unicode-segmenter/intl-adapter`](#export-unicode-segmenterintl-adapter): [`Intl.Segmenter`] adapter
- [`unicode-segmenter/intl-polyfill`](#export-unicode-segmenterintl-polyfill): [`Intl.Segmenter`] polyfill

And extra utilities for combined use cases.

- [`unicode-segmenter/emoji`](#export-unicode-segmenteremoji): Matches single codepoint emojis
- [`unicode-segmenter/general`](#export-unicode-segmentergeneral): Matches single codepoint alphanumerics
- [`unicode-segmenter/utils`](#export-unicode-segmenterutils): Handles UTF-8 and UTF-16 surrogates

### Export `unicode-segmenter/grapheme`
[![](https://edge.bundlejs.com/badge?q=unicode-segmenter/grapheme&treeshake=[*])](https://bundlejs.com/?q=unicode-segmenter%2Fgrapheme&treeshake=%5B*%5D)

Utilities for text segmentation by extended grapheme cluster rules.

#### Example: Count graphemes

```js
import { countGrapheme } from 'unicode-segmenter/grapheme';

'👋 안녕!'.length;
// => 6
countGrapheme('👋 안녕!');
// => 5

'a̐éö̲'.length;
// => 7
countGrapheme('a̐éö̲');
// => 3
```

#### Example: Get grapheme segments

```js
import { graphemeSegments } from 'unicode-segmenter/grapheme';

[...graphemeSegments('a̐éö̲\r\n')];
// 0: { segment: 'a̐', index: 0, input: 'a̐éö̲\r\n' }
// 1: { segment: 'é', index: 2, input: 'a̐éö̲\r\n' }
// 2: { segment: 'ö̲', index: 4, input: 'a̐éö̲\r\n' }
// 3: { segment: '\r\n', index: 7, input: 'a̐éö̲\r\n' }
```

#### Example: Build an advanced grapheme matcher

`graphemeSegments()` exposes some knowledge identified in the middle of the process to support some useful cases.

For example, knowing the [Grapheme_Cluster_Break](https://www.unicode.org/reports/tr29/tr29-43.html#Default_Grapheme_Cluster_Table) category at the beginning and end of a segment can help approximately infer the applied boundary rule.

```js
import { graphemeSegments, GraphemeCategory } from 'unicode-segmenter/grapheme';

function* matchEmoji(str) {
  for (const { segment, _catBegin } of graphemeSegments(input)) {
    // `_catBegin` identified as Extended_Pictographic means the segment is emoji
    if (_catBegin === GraphemeCategory.Extended_Pictographic) {
      yield segment;
    }
  }
}

[...matchEmoji('1🌷2🎁3💩4😜5👍')]
// 0: 🌷
// 1: 🎁
// 2: 💩
// 3: 😜
// 4: 👍
```

### Export `unicode-segmenter/intl-adapter`
[![](https://edge.bundlejs.com/badge?q=unicode-segmenter/intl-adapter&treeshake=[*])](https://bundlejs.com/?q=unicode-segmenter%2Fintl-adapter&treeshake=%5B*%5D)

[`Intl.Segmenter`] API adapter (only `granularity: "grapheme"` available yet)

```js
import { Segmenter } from 'unicode-segmenter/intl-adapter';

// Same API with the `Intl.Segmenter`
const segmenter = new Segmenter();
```

### Export `unicode-segmenter/intl-polyfill`
[![](https://edge.bundlejs.com/badge?q=unicode-segmenter/intl-polyfill&treeshake=[*])](https://bundlejs.com/?q=unicode-segmenter%2Fintl-polyfill&treeshake=%5B*%5D)

[`Intl.Segmenter`] API polyfill (only `granularity: "grapheme"` available yet)

```js
// Apply polyfill to the `globalThis.Intl` object.
import 'unicode-segmenter/intl-polyfill';

const segmenter = new Intl.Segmenter();
```

### Export `unicode-segmenter/emoji`
[![](https://edge.bundlejs.com/badge?q=unicode-segmenter/emoji&treeshake=[*])](https://bundlejs.com/?q=unicode-segmenter%2Femoji&treeshake=%5B*%5D)

Utilities for matching emoji-like characters.

#### Example: Use Unicode emoji property matches

```js
import {
  isEmojiPresentation,    // match \p{Emoji_Presentation}
  isExtendedPictographic, // match \p{Extended_Pictographic}
} from 'unicode-segmenter/emoji';

isEmojiPresentation('😍'.codePointAt(0));
// => true
isEmojiPresentation('♡'.codePointAt(0));
// => false

isExtendedPictographic('😍'.codePointAt(0));
// => true
isExtendedPictographic('♡'.codePointAt(0));
// => true
```

### Export `unicode-segmenter/general`
[![](https://edge.bundlejs.com/badge?q=unicode-segmenter/general&treeshake=[*])](https://bundlejs.com/?q=unicode-segmenter%2Fgeneral&treeshake=%5B*%5D)

Utilities for matching alphanumeric characters.

#### Example: Use Unicode general property matchers

```js
import {
  isLetter,       // match \p{L}
  isNumeric,      // match \p{N}
  isAlphabetic,   // match \p{Alphabetic}
  isAlphanumeric, // match [\p{N}\p{Alphabetic}]
} from 'unicode-segmenter/general';
```

### Export `unicode-segmenter/utils`
[![](https://edge.bundlejs.com/badge?q=unicode-segmenter/utils&treeshake=[*])](https://bundlejs.com/?q=unicode-segmenter%2Futils&treeshake=%5B*%5D)

You can access some internal utilities to deal with JavaScript strings.

#### Example: Handle UTF-16 surrogate pairs

```js
import {
  isHighSurrogate,
  isLowSurrogate,
  surrogatePairToCodePoint,
} from 'unicode-segmenter/utils';

const u32 = '😍';
const hi = u32.charCodeAt(0);
const lo = u32.charCodeAt(1);

if (isHighSurrogate(hi) && isLowSurrogate(lo)) {
  const codePoint = surrogatePairToCodePoint(hi, lo);
  // => equivalent to u32.codePointAt(0)
}
```

#### Example: Determine the length of a character

```js
import { isBMP } from 'unicode-segmenter/utils';

const char = '😍'; // .length = 2
const cp = char.codePointAt(0);

char.length === isBMP(cp) ? 1 : 2;
// => true
```

## Runtime Compatibility

`unicode-segmenter` uses only fundamental features of ES2015, making it compatible with most browsers.

To ensure compatibility, the runtime should support:
- [`String.prototype.codePointAt()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt)
- [Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)
- [Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

If the runtime doesn't support these features, it can easily be fulfilled with tools like Babel.

## React Native Support

Since [Hermes doesn't support the `Intl.Segmenter` API](https://github.com/facebook/hermes/blob/main/doc/IntlAPIs.md), `unicode-segmenter` is a good alternative.

`unicode-segmenter` is compiled into efficient Hermes bytecode than others. See https://github.com/cometkim/unicode-segmenter/pull/47 for detail.

## Benchmarks

`unicode-segmenter` aims to be lighter and faster than alternatives in the ecosystem while fully spec compliant. So the benchmark is tracking the performance, bundle size, and Unicode version compliance of several libraries.

See more on [benchmark](benchmark).

### `unicode-segmenter/grapheme` vs

- Node.js' [`Intl.Segmenter`] (browser's version may vary)
- [graphemer]@1.4.0 (16.6M+ weekly downloads on NPM)
- [grapheme-splitter]@1.0.4 (5.7M+ weekly downloads on NPM)
- [@formatjs/intl-segmenter]@11.5.7 (5.4K+ weekly downloads on NPM)
- WebAssembly build of the Rust [unicode-segmentation] library

#### Package stats

| Name                         | Unicode® | ESM? |   Size    | Size (min) | Size (min+gzip) | Size (min+br) |
|------------------------------|----------|------|----------:|-----------:|----------------:|--------------:|
| `unicode-segmenter/grapheme` |   15.1.0 |    ✔️ |    33,305 |     29,713 |           9,368 |         5,684 |
| `graphemer`                  |   15.0.0 |    ✖️ ️|   410,424 |     95,104 |          15,752 |        10,660 |
| `grapheme-splitter`          |   10.0.0 |    ✖️ |   122,241 |     23,680 |           7,852 |         4,841 |
| `unicode-segmentation`*      |   15.0.0 |    ✔️ |    51,251 |     51,251 |          22,545 |        16,614 |
| `@formatjs/intl-segmenter`*  |   15.0.0 |    ✖️ |   492,079 |    319,109 |          54,346 |        34,365 |
| `Intl.Segmenter`*            |        - |    - |         0 |          0 |               0 |             0 |

* `unicode-segmentation` size contains only the minimum WASM binary. It will be larger by adding more bindings.
* `@formatjs/intl-segmenter` handles grapheme, word, sentence, but it's not tree-shakable.
* `Intl.Segmenter`'s Unicode data is always kept up to date as the runtime support.
* `Intl.Segmenter` may not be available in [some old browsers](https://caniuse.com/mdn-javascript_builtins_intl_segmenter), edge runtimes, or embedded environments.

#### Runtime performance

`unicode-segmenter/grapheme` is 7\~18x faster than other JS alternatives, 3\~8x faster than native [`Intl.Segmenter`]), and 1.5\~3x faster than WASM build of the Rust [unicode-segmentation] library.

The gap may increase depending on the environment. Bindings for browsers generally appear to perform worse. In most environments, `unicode-segmenter/grapheme` is over 6x faster than `graphemer`.

<details>
  <summary>Details</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v20.13.1 (arm64-darwin)

  benchmark                                        time (avg)             (min … max)       p75       p99      p999
  ----------------------------------------------------------------------------------- -----------------------------
  • Lorem ipsum (ascii)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                    5'668 ns/iter   (5'332 ns … 6'582 ns)  5'778 ns  6'326 ns  6'582 ns
  Intl.Segmenter                               51'811 ns/iter    (47'208 ns … 524 µs) 51'917 ns 61'708 ns    436 µs
  graphemer                                    49'103 ns/iter    (46'583 ns … 280 µs) 48'625 ns    101 µs    182 µs
  grapheme-splitter                               123 µs/iter     (117 µs … 1'066 µs)    122 µs    171 µs    816 µs
  unicode-rs/unicode-segmentation (wasm-pack)  16'935 ns/iter    (15'542 ns … 274 µs) 16'542 ns 30'084 ns    130 µs
  @formatjs/intl-segmenter                     42'689 ns/iter    (38'792 ns … 941 µs) 41'875 ns    106 µs    216 µs

  summary for Lorem ipsum (ascii)
    unicode-segmenter/grapheme
     2.99x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.53x faster than @formatjs/intl-segmenter
     8.66x faster than graphemer
     9.14x faster than Intl.Segmenter
     21.63x faster than grapheme-splitter

  • Emojis
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                    1'717 ns/iter   (1'656 ns … 1'941 ns)  1'727 ns  1'939 ns  1'941 ns
  Intl.Segmenter                               14'715 ns/iter  (12'334 ns … 1'301 µs) 13'792 ns 20'000 ns    820 µs
  graphemer                                    13'752 ns/iter  (12'625 ns … 1'385 µs) 13'583 ns 22'875 ns    136 µs
  grapheme-splitter                            27'406 ns/iter    (26'625 ns … 427 µs) 26'958 ns 32'333 ns 69'042 ns
  unicode-rs/unicode-segmentation (wasm-pack)   5'728 ns/iter  (5'497 ns … 12'383 ns)  5'711 ns  6'953 ns 12'383 ns
  @formatjs/intl-segmenter                     14'579 ns/iter    (13'541 ns … 377 µs) 14'541 ns 19'583 ns    166 µs

  summary for Emojis
    unicode-segmenter/grapheme
     3.34x faster than unicode-rs/unicode-segmentation (wasm-pack)
     8.01x faster than graphemer
     8.49x faster than @formatjs/intl-segmenter
     8.57x faster than Intl.Segmenter
     15.96x faster than grapheme-splitter

  • Demonic characters
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                    1'699 ns/iter   (1'636 ns … 1'986 ns)  1'719 ns  1'891 ns  1'986 ns
  Intl.Segmenter                                5'088 ns/iter   (3'501 ns … 9'109 ns)  7'867 ns  9'083 ns  9'109 ns
  graphemer                                    27'386 ns/iter    (26'333 ns … 332 µs) 26'958 ns 30'333 ns    161 µs
  grapheme-splitter                            19'959 ns/iter    (18'958 ns … 380 µs) 19'500 ns 24'333 ns    247 µs
  unicode-rs/unicode-segmentation (wasm-pack)   2'518 ns/iter   (2'444 ns … 4'894 ns)  2'534 ns  2'839 ns  4'894 ns
  @formatjs/intl-segmenter                     17'272 ns/iter    (16'708 ns … 231 µs) 17'375 ns 18'541 ns 39'000 ns

  summary for Demonic characters
    unicode-segmenter/grapheme
     1.48x faster than unicode-rs/unicode-segmentation (wasm-pack)
     2.99x faster than Intl.Segmenter
     10.16x faster than @formatjs/intl-segmenter
     11.74x faster than grapheme-splitter
     16.11x faster than graphemer

  • Tweet text (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                    8'025 ns/iter   (7'867 ns … 8'619 ns)  8'168 ns  8'614 ns  8'619 ns
  Intl.Segmenter                               70'021 ns/iter    (63'667 ns … 562 µs) 69'875 ns 79'458 ns    519 µs
  graphemer                                    69'922 ns/iter    (66'583 ns … 320 µs) 69'708 ns 92'875 ns    271 µs
  grapheme-splitter                               152 µs/iter       (147 µs … 467 µs)    153 µs    165 µs    429 µs
  unicode-rs/unicode-segmentation (wasm-pack)  24'428 ns/iter    (23'583 ns … 302 µs) 24'084 ns 27'334 ns    157 µs
  @formatjs/intl-segmenter                     64'112 ns/iter    (61'333 ns … 338 µs) 63'083 ns 88'625 ns    272 µs

  summary for Tweet text (combined)
    unicode-segmenter/grapheme
     3.04x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.99x faster than @formatjs/intl-segmenter
     8.71x faster than graphemer
     8.72x faster than Intl.Segmenter
     18.91x faster than grapheme-splitter

  • Code snippet (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                   19'661 ns/iter    (18'125 ns … 350 µs) 19'458 ns 24'708 ns    185 µs
  Intl.Segmenter                                  158 µs/iter       (148 µs … 443 µs)    158 µs    323 µs    428 µs
  graphemer                                       163 µs/iter       (159 µs … 401 µs)    161 µs    284 µs    390 µs
  grapheme-splitter                               350 µs/iter       (343 µs … 712 µs)    348 µs    424 µs    705 µs
  unicode-rs/unicode-segmentation (wasm-pack)  57'376 ns/iter    (55'917 ns … 300 µs) 56'667 ns 67'959 ns    209 µs
  @formatjs/intl-segmenter                        150 µs/iter       (142 µs … 579 µs)    150 µs    310 µs    475 µs

  summary for Code snippet (combined)
    unicode-segmenter/grapheme
     2.92x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.65x faster than @formatjs/intl-segmenter
     8.03x faster than Intl.Segmenter
     8.3x faster than graphemer
     17.79x faster than grapheme-splitter
  ```

</details>

## LICENSE

[MIT](LICENSE)

> [!NOTE]
> The initial implementation was ported manually from Rust's [unicode-segmentation] library, which is licenced under the [MIT](licenses/unicode-segmentation_MIT.txt) license.

[Hermes]: https://hermesengine.dev/
[QuickJS]: https://bellard.org/quickjs/
[unicode-segmentation]: https://github.com/unicode-rs/unicode-segmentation
[`Intl.Segmenter`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
[graphemer]: https://github.com/flmnt/graphemer
[grapheme-splitter]: https://github.com/orling/grapheme-splitter
[emoji-regex]: https://github.com/mathiasbynens/emoji-regex
[emojibase-regex]: https://emojibase.dev/docs/regex
[XRegExp]: https://xregexp.com/
[@formatjs/intl-segmenter]: https://formatjs.io/docs/polyfills/intl-segmenter/
