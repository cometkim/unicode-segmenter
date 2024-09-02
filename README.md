# unicode-segmenter
[![NPM Package Version](https://img.shields.io/npm/v/unicode-segmenter)](https://npmjs.com/package/unicode-segmenter)
[![NPM Downloads](https://img.shields.io/npm/dw/unicode-segmenter)](https://npmjs.com/package/unicode-segmenter)
[![Integration](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml/badge.svg)](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/cometkim/unicode-segmenter/graph/badge.svg?token=3rA29JEH4J)](https://codecov.io/gh/cometkim/unicode-segmenter)
[![LICENSE - MIT](https://img.shields.io/github/license/cometkim/unicode-segmenter)](#license)

A lightweight implementation of the [Unicode Text Segmentation (UAX \#29)](https://www.unicode.org/reports/tr29)

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
| `unicode-segmenter/grapheme` |   15.1.0 |    ✔️ |    28,337 |     24,623 |           6,599 |         4,360 |
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
  runtime: node v20.17.0 (arm64-darwin)
  
  benchmark                                        time (avg)             (min … max)       p75       p99      p999
  ----------------------------------------------------------------------------------- -----------------------------
  • Lorem ipsum (ascii)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                    6'316 ns/iter     (5'708 ns … 275 µs)  6'166 ns 10'542 ns 76'458 ns
  Intl.Segmenter                               50'929 ns/iter    (47'250 ns … 444 µs) 50'833 ns 63'541 ns    333 µs
  graphemer                                    48'254 ns/iter    (46'500 ns … 241 µs) 47'250 ns 75'416 ns    145 µs
  grapheme-splitter                            76'231 ns/iter    (73'500 ns … 306 µs) 76'333 ns 92'958 ns    225 µs
  unicode-rs/unicode-segmentation (wasm-pack)  17'123 ns/iter  (15'750 ns … 1'052 µs) 16'583 ns 21'334 ns    172 µs
  @formatjs/intl-segmenter                     41'896 ns/iter  (38'583 ns … 1'584 µs) 40'667 ns    107 µs    252 µs
  
  summary for Lorem ipsum (ascii)
    unicode-segmenter/grapheme
     2.71x faster than unicode-rs/unicode-segmentation (wasm-pack)
     6.63x faster than @formatjs/intl-segmenter
     7.64x faster than graphemer
     8.06x faster than Intl.Segmenter
     12.07x faster than grapheme-splitter
  
  • Emojis
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                    1'943 ns/iter   (1'879 ns … 2'175 ns)  1'965 ns  2'126 ns  2'175 ns
  Intl.Segmenter                               14'548 ns/iter  (12'250 ns … 1'362 µs) 13'708 ns 19'000 ns    818 µs
  graphemer                                    13'464 ns/iter    (12'583 ns … 560 µs) 13'250 ns 17'500 ns    138 µs
  grapheme-splitter                            27'387 ns/iter    (26'625 ns … 579 µs) 27'000 ns 30'875 ns 48'041 ns
  unicode-rs/unicode-segmentation (wasm-pack)   5'751 ns/iter   (5'551 ns … 6'208 ns)  5'830 ns  6'175 ns  6'208 ns
  @formatjs/intl-segmenter                     15'030 ns/iter    (13'709 ns … 257 µs) 14'833 ns 19'084 ns    184 µs
  
  summary for Emojis
    unicode-segmenter/grapheme
     2.96x faster than unicode-rs/unicode-segmentation (wasm-pack)
     6.93x faster than graphemer
     7.49x faster than Intl.Segmenter
     7.74x faster than @formatjs/intl-segmenter
     14.09x faster than grapheme-splitter
  
  • Hindi
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                    6'633 ns/iter   (6'439 ns … 6'937 ns)  6'713 ns  6'919 ns  6'937 ns
  Intl.Segmenter                               37'551 ns/iter    (33'958 ns … 840 µs) 36'750 ns 43'958 ns    638 µs
  graphemer                                    49'185 ns/iter    (47'375 ns … 400 µs) 48'333 ns 55'875 ns    232 µs
  grapheme-splitter                            99'486 ns/iter    (96'042 ns … 508 µs) 99'625 ns    112 µs    459 µs
  unicode-rs/unicode-segmentation (wasm-pack)  16'594 ns/iter    (15'791 ns … 295 µs) 16'584 ns 18'625 ns 68'709 ns
  @formatjs/intl-segmenter                     48'197 ns/iter    (45'583 ns … 319 µs) 48'125 ns 56'375 ns    213 µs
  
  summary for Hindi
    unicode-segmenter/grapheme
     2.5x faster than unicode-rs/unicode-segmentation (wasm-pack)
     5.66x faster than Intl.Segmenter
     7.27x faster than @formatjs/intl-segmenter
     7.42x faster than graphemer
     15x faster than grapheme-splitter
  
  • Demonic characters
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                    1'884 ns/iter   (1'773 ns … 2'084 ns)  1'920 ns  2'057 ns  2'084 ns
  Intl.Segmenter                                5'169 ns/iter   (3'529 ns … 9'480 ns)  8'078 ns  8'892 ns  9'480 ns
  graphemer                                    27'576 ns/iter  (26'333 ns … 2'834 µs) 26'916 ns 32'542 ns    179 µs
  grapheme-splitter                            20'048 ns/iter    (18'958 ns … 456 µs) 19'500 ns 24'583 ns    267 µs
  unicode-rs/unicode-segmentation (wasm-pack)   2'490 ns/iter   (2'450 ns … 2'771 ns)  2'500 ns  2'665 ns  2'771 ns
  @formatjs/intl-segmenter                     17'327 ns/iter    (16'833 ns … 309 µs) 17'125 ns 18'917 ns 36'167 ns
  
  summary for Demonic characters
    unicode-segmenter/grapheme
     1.32x faster than unicode-rs/unicode-segmentation (wasm-pack)
     2.74x faster than Intl.Segmenter
     9.19x faster than @formatjs/intl-segmenter
     10.64x faster than grapheme-splitter
     14.63x faster than graphemer
  
  • Tweet text (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                    9'132 ns/iter   (8'890 ns … 9'951 ns)  9'158 ns  9'757 ns  9'951 ns
  Intl.Segmenter                               67'826 ns/iter    (63'708 ns … 432 µs) 68'125 ns 76'500 ns    395 µs
  graphemer                                    69'152 ns/iter    (66'834 ns … 311 µs) 68'083 ns 78'375 ns    258 µs
  grapheme-splitter                               150 µs/iter       (147 µs … 618 µs)    149 µs    161 µs    554 µs
  unicode-rs/unicode-segmentation (wasm-pack)  24'408 ns/iter    (23'750 ns … 362 µs) 24'125 ns 27'542 ns    160 µs
  @formatjs/intl-segmenter                     64'550 ns/iter    (62'166 ns … 299 µs) 63'416 ns 77'583 ns    231 µs
  
  summary for Tweet text (combined)
    unicode-segmenter/grapheme
     2.67x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.07x faster than @formatjs/intl-segmenter
     7.43x faster than Intl.Segmenter
     7.57x faster than graphemer
     16.42x faster than grapheme-splitter
  
  • Code snippet (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                   21'593 ns/iter    (20'583 ns … 204 µs) 21'083 ns 28'709 ns    130 µs
  Intl.Segmenter                                  156 µs/iter       (148 µs … 378 µs)    154 µs    297 µs    340 µs
  graphemer                                       165 µs/iter       (159 µs … 391 µs)    164 µs    288 µs    356 µs
  grapheme-splitter                               352 µs/iter       (342 µs … 730 µs)    351 µs    426 µs    713 µs
  unicode-rs/unicode-segmentation (wasm-pack)  58'288 ns/iter    (56'125 ns … 325 µs) 58'334 ns 67'041 ns    223 µs
  @formatjs/intl-segmenter                        149 µs/iter       (143 µs … 426 µs)    147 µs    267 µs    367 µs
  
  summary for Code snippet (combined)
    unicode-segmenter/grapheme
     2.7x faster than unicode-rs/unicode-segmentation (wasm-pack)
     6.88x faster than @formatjs/intl-segmenter
     7.22x faster than Intl.Segmenter
     7.64x faster than graphemer
     16.28x faster than grapheme-splitter
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
