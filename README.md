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
  unicode-segmenter/grapheme                    5'548 ns/iter   (5'408 ns … 6'464 ns)  5'516 ns  6'363 ns  6'464 ns
  Intl.Segmenter                               50'476 ns/iter    (47'458 ns … 367 µs) 51'083 ns 56'417 ns    309 µs
  graphemer                                    48'219 ns/iter    (46'708 ns … 191 µs) 47'541 ns 74'625 ns    126 µs
  grapheme-splitter                               127 µs/iter     (115 µs … 1'547 µs)    117 µs    448 µs  1'164 µs
  unicode-rs/unicode-segmentation (wasm-pack)  16'319 ns/iter    (15'667 ns … 199 µs) 16'334 ns 18'083 ns 94'917 ns
  @formatjs/intl-segmenter                     41'538 ns/iter    (38'459 ns … 647 µs) 41'208 ns    101 µs    198 µs
  
  summary for Lorem ipsum (ascii)
    unicode-segmenter/grapheme
     2.94x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.49x faster than @formatjs/intl-segmenter
     8.69x faster than graphemer
     9.1x faster than Intl.Segmenter
     22.94x faster than grapheme-splitter
  
  • Emojis
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                    1'862 ns/iter   (1'745 ns … 2'150 ns)  1'911 ns  2'105 ns  2'150 ns
  Intl.Segmenter                               15'238 ns/iter  (12'458 ns … 2'478 µs) 14'375 ns 19'041 ns 61'458 ns
  graphemer                                    13'790 ns/iter    (12'667 ns … 921 µs) 13'667 ns 16'792 ns    126 µs
  grapheme-splitter                            28'216 ns/iter    (26'666 ns … 530 µs) 27'875 ns 31'667 ns 67'042 ns
  unicode-rs/unicode-segmentation (wasm-pack)   5'763 ns/iter   (5'495 ns … 6'293 ns)  5'824 ns  6'293 ns  6'293 ns
  @formatjs/intl-segmenter                     14'154 ns/iter    (13'500 ns … 305 µs) 13'834 ns 19'000 ns    157 µs
  
  summary for Emojis
    unicode-segmenter/grapheme
     3.1x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.41x faster than graphemer
     7.6x faster than @formatjs/intl-segmenter
     8.19x faster than Intl.Segmenter
     15.16x faster than grapheme-splitter
  
  • Demonic characters
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                    1'751 ns/iter   (1'686 ns … 1'845 ns)  1'775 ns  1'842 ns  1'845 ns
  Intl.Segmenter                                5'310 ns/iter  (3'602 ns … 12'482 ns)  8'106 ns 11'741 ns 12'482 ns
  graphemer                                    27'799 ns/iter  (26'209 ns … 2'706 µs) 27'500 ns 34'209 ns    150 µs
  grapheme-splitter                            20'008 ns/iter    (18'833 ns … 459 µs) 19'708 ns 24'625 ns    279 µs
  unicode-rs/unicode-segmentation (wasm-pack)   2'673 ns/iter  (2'450 ns … 10'949 ns)  2'552 ns  9'738 ns 10'949 ns
  @formatjs/intl-segmenter                     17'255 ns/iter    (16'708 ns … 291 µs) 17'083 ns 18'875 ns 32'792 ns
  
  summary for Demonic characters
    unicode-segmenter/grapheme
     1.53x faster than unicode-rs/unicode-segmentation (wasm-pack)
     3.03x faster than Intl.Segmenter
     9.85x faster than @formatjs/intl-segmenter
     11.43x faster than grapheme-splitter
     15.88x faster than graphemer
  
  • Tweet text (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                    8'453 ns/iter   (8'180 ns … 8'917 ns)  8'633 ns  8'896 ns  8'917 ns
  Intl.Segmenter                               67'694 ns/iter    (63'583 ns … 581 µs) 66'875 ns 79'083 ns    454 µs
  graphemer                                    69'513 ns/iter    (66'750 ns … 360 µs) 69'459 ns 81'417 ns    230 µs
  grapheme-splitter                               149 µs/iter       (146 µs … 512 µs)    149 µs    163 µs    489 µs
  unicode-rs/unicode-segmentation (wasm-pack)  24'916 ns/iter    (23'667 ns … 321 µs) 25'333 ns 30'083 ns    161 µs
  @formatjs/intl-segmenter                     64'955 ns/iter    (61'625 ns … 441 µs) 63'917 ns    146 µs    290 µs
  
  summary for Tweet text (combined)
    unicode-segmenter/grapheme
     2.95x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.68x faster than @formatjs/intl-segmenter
     8.01x faster than Intl.Segmenter
     8.22x faster than graphemer
     17.66x faster than grapheme-splitter
  
  • Code snippet (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter/grapheme                   20'296 ns/iter    (18'958 ns … 245 µs) 19'916 ns 27'417 ns    162 µs
  Intl.Segmenter                                  164 µs/iter       (149 µs … 499 µs)    164 µs    345 µs    460 µs
  graphemer                                       167 µs/iter       (159 µs … 369 µs)    168 µs    295 µs    340 µs
  grapheme-splitter                               352 µs/iter       (341 µs … 720 µs)    353 µs    469 µs    701 µs
  unicode-rs/unicode-segmentation (wasm-pack)  58'193 ns/iter    (56'125 ns … 372 µs) 57'542 ns 68'042 ns    245 µs
  @formatjs/intl-segmenter                        147 µs/iter       (142 µs … 434 µs)    145 µs    285 µs    369 µs
  
  summary for Code snippet (combined)
    unicode-segmenter/grapheme
     2.87x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.24x faster than @formatjs/intl-segmenter
     8.07x faster than Intl.Segmenter
     8.24x faster than graphemer
     17.35x faster than grapheme-splitter
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
