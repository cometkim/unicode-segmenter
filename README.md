# unicode-segmenter
[![Package Version](https://img.shields.io/npm/v/unicode-segmenter)](https://npm.im/unicode-segmenter)
[![Integration](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml/badge.svg)](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/cometkim/unicode-segmenter/graph/badge.svg?token=3rA29JEH4J)](https://codecov.io/gh/cometkim/unicode-segmenter)
[![LICENSE - MIT](https://img.shields.io/github/license/cometkim/unicode-segmenter)](#license)

A lightweight and fast, pure JavaScript library for Unicode segmentation.

## Features

`unicode-segmenter` includes utilities to deal with:
- Emojis and pictographic [⤵](#export-unicode-segmenteremoji)
- Extended grapheme clusters [⤵](#export-unicode-segmentergrapheme)
- Non-Latin alphabets and numbers [⤵](#export-unicode-segmentergeneral)
- UTF-8 characters and UTF-16 surrogates [⤵](#export-unicode-segmenterutils)
- [`Intl.Segmenter`] Polyfill [⤵](#export-unicode-segmenterintl-adapter)

With no dependencies, so you can use it even in places where built-in Unicode libraries aren't available, such as old browsers, edge runtimes, and embedded environments.

## Unicode® version

Unicode® 15.1.0 Standard [Annex \#29 Revision 43](https://www.unicode.org/reports/tr29/tr29-43.html) (2023-08-16)

## Runtime compatibility

`unicode-segmenter` uses most basic ES6+ features like [generators](https://caniuse.com/es6-generators), [modules](https://caniuse.com/es6-module) and [`String.prototype.codePointAt()`](https://caniuse.com/mdn-javascript_builtins_string_codepointat).

Those are available in lightweight JS runtimes like [QuickJS](https://bellard.org/quickjs/) as well as (not very) modern browsers. You can still use the library even in IE11 by transpiling/polyfilling them using Babel, regenerator, etc.

## Usage

### Using TypeScript

No worry. The project is fully type-checked, and provides `*.d.ts` for you 😉

### Export `unicode-segmenter/emoji`
[![](https://edge.bundlejs.com/badge?q=unicode-segmenter/emoji&treeshake=[*])](https://bundlejs.com/?q=unicode-segmenter%2Femoji&treeshake=%5B*%5D)

Utilities for matching emoji-like characters

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

Utilities for matching alphanumeric characters

#### Example: Use Unicode general property matchers

```js
import {
  isLetter,       // match \p{L}
  isNumeric,      // match \p{N}
  isAlphabetic,   // match \p{Alphabetic}
  isAlphanumeric, // match [\p{N}\p{Alphabetic}]
} from 'unicode-segmenter/general';
```

### Export `unicode-segmenter/grapheme`
[![](https://edge.bundlejs.com/badge?q=unicode-segmenter/grapheme&treeshake=[*])](https://bundlejs.com/?q=unicode-segmenter%2Fgrapheme&treeshake=%5B*%5D)

Utilities for text segmentation by extended grapheme cluster rules

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

### Export `unicode-segmenter/utils`
[![](https://edge.bundlejs.com/badge?q=unicode-segmenter/utils&treeshake=[*])](https://bundlejs.com/?q=unicode-segmenter%2Futils&treeshake=%5B*%5D)

You can access some internal utilities to deal with UTF-8 in the JavaScript

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

## Benchmarks

`unicode-segmenter` aims to be lighter and faster than alternatives in the ecosystem while fully spec compliant. So the benchmark is tracking the performance, bundle size, and Unicode version compliance of several libraries.

Look [benchmark](benchmark) to see how it works.

### `unicode-segmenter/emoji` vs

- built-in Unicode `RegExp`
- [emoji-regex]@10.3.0 (101M+ weekly downloads on NPM)
- [emojibase-regex]@15.3.2 (192K+ weekly downloads on NPM)

#### Package stats

| Name                      | Unicode®       | ESM? | Size    | Size (min) | Size (min+gzip) | Size (min+br) |
|---------------------------|----------------|------|--------:|-----------:|----------------:|--------------:|
| `unicode-segmenter/emoji` | 15.1.0         |    ✔️ |   3,058 |      2,611 |           1,041 |           751 |
| `emoji-regex`             | 15.1.0 (vary)* |    ✔️ |  12,946 |     12,859 |           2,180 |         1,746 |
| `emojibase-regex`*        | 15.1.0         |    ✖️ |  17,711 |     16,595 |           2,870 |         2,317 |
| `emojibase-regex/emoji`*  | 15.1.0         |    ✖️ |  13,550 |     12,458 |           2,835 |         2,210 |
| `RegExp` w/ `u`*          |              - |    - |       0 |          0 |               0 |             0 |

* You can build your own `emoji-regex` using [emoji-test-regex-pattern](https://github.com/mathiasbynens/emoji-test-regex-pattern).
* `emojibase-regex` matches `Extended_Pictographic` property.
* `emojibase-regex/emoji` matches only `Emoji_Presentation` property.
* `RegExp` Unicode data is always kept up to date as the runtime support.
* `RegExp` Unicode may not be available in [some old browsers](https://caniuse.com/mdn-javascript_builtins_regexp_unicode), edge runtimes, or embedded environments.

#### Runtime performance

The runtime performance of `unicode-segmenter/emoji` is enough to test the presence of emoji in a text.

It's \~3x worse than `RegExp` w/ `u` for match-all performance, but that's not a good example because that doesn't care about grapheme clusters.

You can handle emojis in between grapheme processing by `unicode-segmenter/grapheme`. It's a bit less performant than the dedicated emoji matchers, but it's not that worse, and actually reasonable in the real world.

<details>
  <summary>Details</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v20.13.1 (arm64-darwin)
  
  benchmark                       time (avg)             (min … max)       p75       p99      p999
  ------------------------------------------------------------------ -----------------------------
  • checking if any emoji (Extended_Pictographic)
  ------------------------------------------------------------------ -----------------------------
  unicode-segmenter/emoji       14.2 ns/iter     (13.41 ns … 213 ns)  14.26 ns  17.09 ns   36.7 ns
  unicode-segmenter/grapheme   88.82 ns/iter     (76.01 ns … 479 ns)  94.75 ns    117 ns    282 ns
  RegExp w/ unicode            15.19 ns/iter   (14.87 ns … 78.88 ns)  15.04 ns  18.62 ns  30.84 ns
  emoji-regex                  40.85 ns/iter   (40.53 ns … 73.79 ns)  40.67 ns  45.49 ns  53.63 ns
  emojibase-regex                110 ns/iter       (109 ns … 163 ns)    110 ns    123 ns    142 ns
  
  summary for checking if any emoji (Extended_Pictographic)
    unicode-segmenter/emoji
     1.07x faster than RegExp w/ unicode
     2.88x faster than emoji-regex
     6.25x faster than unicode-segmenter/grapheme
     7.78x faster than emojibase-regex
  
  • match all emoji (Extended_Pictographic)
  ------------------------------------------------------------------ -----------------------------
  unicode-segmenter/emoji      2'754 ns/iter     (2'583 ns … 495 µs)  2'709 ns  3'000 ns 10'500 ns
  unicode-segmenter/grapheme   7'718 ns/iter   (7'557 ns … 9'363 ns)  7'740 ns  8'729 ns  9'363 ns
  RegExp w/ unicode              959 ns/iter     (932 ns … 1'196 ns)    967 ns  1'074 ns  1'196 ns
  emoji-regex                 11'171 ns/iter    (10'875 ns … 292 µs) 11'167 ns 12'209 ns 27'333 ns
  emojibase-regex             16'427 ns/iter    (16'125 ns … 289 µs) 16'334 ns 17'750 ns 32'000 ns
  
  summary for match all emoji (Extended_Pictographic)
    unicode-segmenter/emoji
     2.87x slower than RegExp w/ unicode
     2.8x faster than unicode-segmenter/grapheme
     4.06x faster than emoji-regex
     5.96x faster than emojibase-regex
  ```

</details>

### `unicode-segmenter/general` vs

- built-in unicode `RegExp`
- [XRegExp]@5.1.1 (2.8M+ weekly downloads on NPM)

#### Package stats

| Name                        | Unicode® | ESM? | Size    | Size (min) | Size (min+gzip) | Size (min+br) |
|-----------------------------|----------|------|--------:|-----------:|----------------:|--------------:|
| `unicode-segmenter/general` |   15.1.0 |    ✔️ |  21,505 |     20,972 |           5,792 |         3,564 |
| `XRegExp`                   |   14.0.0 |    ✖️ ️| 383,156 |    194,202 |          62,986 |        39,871 |
| `RegExp` w/ `u`*            |        - |    - |       0 |          0 |               0 |             0 |

* `RegExp` Unicode data is always kept up to date as the runtime support.
* `RegExp` Unicode may not be available in [some old browsers](https://caniuse.com/mdn-javascript_builtins_regexp_unicode), edge runtimes, or embedded environments.

#### Runtime performance

Depending on your usage, `unicode-segmenter/general` may be slightly faster than `RegExp` w/ `u` and suitable for more advanced use cases.

<details>
  <summary>Details</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v20.13.1 (arm64-darwin)
  
  benchmark                      time (avg)             (min … max)       p75       p99      p999
  ----------------------------------------------------------------- -----------------------------
  • checking any alphanumeric
  ----------------------------------------------------------------- -----------------------------
  unicode-segmenter/general     212 ns/iter       (206 ns … 413 ns)    215 ns    231 ns    272 ns
  XRegExp                       243 ns/iter       (237 ns … 394 ns)    245 ns    293 ns    320 ns
  RegExp w/ unicode             235 ns/iter       (232 ns … 398 ns)    236 ns    259 ns    335 ns
  
  summary for checking any alphanumeric
    unicode-segmenter/general
     1.11x faster than RegExp w/ unicode
     1.15x faster than XRegExp
  
  • match all alphanumeric
  ----------------------------------------------------------------- -----------------------------
  unicode-segmenter/general     340 ns/iter       (330 ns … 992 ns)    351 ns    389 ns    992 ns
  XRegExp                     1'928 ns/iter   (1'900 ns … 2'014 ns)  1'938 ns  2'007 ns  2'014 ns
  RegExp w/ unicode             431 ns/iter       (420 ns … 513 ns)    441 ns    488 ns    513 ns
  
  summary for match all alphanumeric
    unicode-segmenter/general
     1.27x faster than RegExp w/ unicode
     5.67x faster than XRegExp
  ```

</details>

### `unicode-segmenter/grapheme` vs

- Node.js' [`Intl.Segmenter`] (browser's version may vary)
- [graphemer]@1.4.0 (16.6M+ weekly downloads on NPM)
- [grapheme-splitter]@1.0.4 (5.7M+ weekly downloads on NPM)
- [@formatjs/intl-segmenter]@11.5.7 (5.4K+ weekly downloads on NPM)
- WebAssembly build of the Rust [unicode-segmentation] library

#### Package stats

| Name                         | Unicode® | ESM? |   Size    | Size (min) | Size (min+gzip) | Size (min+br) |
|------------------------------|----------|------|----------:|-----------:|----------------:|--------------:|
| `unicode-segmenter/grapheme` |   15.1.0 |    ✔️ |    33,307 |     29,712 |           9,364 |         5,675 |
| `graphemer`                  |   15.0.0 |    ✖️ ️|   410,424 |     95,104 |          15,752 |        10,660 |
| `grapheme-splitter`          |   10.0.0 |    ✖️ |   122,241 |     23,680 |           7,852 |         4,841 |
| `unicode-segmentation`*      |   15.0.0 |    ✔️ |    51,251 |     51,251 |          22,545 |        16,614 |
| `@formatjs/intl-segmenter`*  |   15.0.0 |    ✖️ |   492,803 |    319,109 |          54,346 |        34,365 |
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

[unicode-segmentation]: https://github.com/unicode-rs/unicode-segmentation
[`Intl.Segmenter`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
[graphemer]: https://github.com/flmnt/graphemer
[grapheme-splitter]: https://github.com/orling/grapheme-splitter
[emoji-regex]: https://github.com/mathiasbynens/emoji-regex
[XRegExp]: https://xregexp.com/
[@formatjs/intl-segmenter]: https://formatjs.io/docs/polyfills/intl-segmenter/
