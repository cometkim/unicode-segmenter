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

```js
import { graphemeSegments, GraphemeCategory } from 'unicode-segmenter/grapheme';

function* matchEmoji(str) {
  // internal field `_cat` is GraphemeCategory value of the match index
  for (const { segment, _cat } of graphemeSegments(input)) {
    if (_cat === GraphemeCategory.Extended_Pictographic) {
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

| Name                      | Unicode®      | ESM? | Size    | Size (min) | Size (min+gzip) | Size (min+br) |
|---------------------------|---------------|------|--------:|-----------:|----------------:|--------------:|
| `unicode-segmenter/emoji` | 15.1.0        |    ✔️ |   3,058 |      2,611 |           1,041 |           751 |
| `emoji-regex`             | 15.1.0 (vary) |    ✔️ |  12,946 |     12,859 |           2,180 |         1,746 |
| `emojibase-regex`*        | 15.1.0        |    ✖️ |  17,711 |     16,595 |           2,870 |         2,317 |
| `emojibase-regex/emoji`*  | 15.1.0        |    ✖️ |  13,550 |     12,458 |           2,835 |         2,210 |
| `RegExp` w/ `u`*          |             - |    - |       0 |          0 |               0 |             0 |

* `emojibase-regex` matches `Extended_Pictographic` property.
* `emojibase-regex/emoji` matches only `Emoji_Presentation` property.
* You can build your own `emoji-regex` using [emoji-test-regex-pattern](https://github.com/mathiasbynens/emoji-test-regex-pattern).
* `RegExp` Unicode data is always kept up to date as the runtime support.
* `RegExp` Unicode may not be available in [some old browsers](https://caniuse.com/mdn-javascript_builtins_regexp_unicode), edge runtimes, or embedded environments.

#### Runtime performance

The runtime performance of `unicode-segmenter/emoji` is enough to test the presence of emoji in a text.

It's \~2.5x worse than `RegExp` w/ `u` for match-all performance, but that's useless examples in the real world because others don't care about grapheme clusters.

You can handle emojis in between grapheme processing by `unicode-segmenter/grapheme`. It might be a bit less performant than the dedicated emoji matchers, but it might still be reasonable.

<details>
  <summary>Details</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v20.13.1 (arm64-darwin)
  
  benchmark                       time (avg)             (min … max)       p75       p99      p999
  ------------------------------------------------------------------ -----------------------------
  • checking if any emoji
  ------------------------------------------------------------------ -----------------------------
  unicode-segmenter/emoji       16.1 ns/iter     (15.54 ns … 257 ns)  16.11 ns  19.88 ns  45.92 ns
  unicode-segmenter/grapheme   89.67 ns/iter     (75.44 ns … 938 ns)  94.65 ns    136 ns    473 ns
  RegExp w/ unicode            17.73 ns/iter    (16.5 ns … 90.05 ns)  16.93 ns  36.82 ns  56.01 ns
  emoji-regex                  42.83 ns/iter     (41.32 ns … 409 ns)  43.23 ns  51.88 ns    169 ns
  emojibase-regex                145 ns/iter     (109 ns … 2'300 ns)    111 ns    942 ns  1'952 ns
  emojibase-regex/emoji        77.47 ns/iter     (69.74 ns … 916 ns)  73.97 ns    277 ns    667 ns
  
  summary for checking if any emoji
    unicode-segmenter/emoji
     1.1x faster than RegExp w/ unicode
     2.66x faster than emoji-regex
     4.81x faster than emojibase-regex/emoji
     5.57x faster than unicode-segmenter/grapheme
     9x faster than emojibase-regex
  
  • match all emoji
  ------------------------------------------------------------------ -----------------------------
  unicode-segmenter/emoji      3'223 ns/iter     (3'000 ns … 237 µs)  3'208 ns  3'667 ns 13'417 ns
  unicode-segmenter/grapheme   7'904 ns/iter     (7'333 ns … 290 µs)  7'791 ns  9'625 ns 72'333 ns
  RegExp w/ unicode            1'266 ns/iter   (1'215 ns … 1'374 ns)  1'285 ns  1'362 ns  1'374 ns
  emoji-regex                 11'567 ns/iter    (11'083 ns … 193 µs) 11'666 ns 12'500 ns 28'834 ns
  emojibase-regex             16'934 ns/iter    (16'291 ns … 187 µs) 17'083 ns 18'500 ns 29'708 ns
  
  summary for match all emoji
    unicode-segmenter/emoji
     2.55x slower than RegExp w/ unicode
     2.45x faster than unicode-segmenter/grapheme
     3.59x faster than emoji-regex
     5.25x faster than emojibase-regex
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

`unicode-segmenter/general` is almost equivalent to `RegExp` w/ `u`.

<details>
  <summary>Details</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v20.13.1 (arm64-darwin)
  
  benchmark                      time (avg)             (min … max)       p75       p99      p999
  ----------------------------------------------------------------- -----------------------------
  • checking any alphanumeric
  ----------------------------------------------------------------- -----------------------------
  unicode-segmenter/general     236 ns/iter       (229 ns … 579 ns)    233 ns    304 ns    552 ns
  XRegExp                       243 ns/iter       (239 ns … 319 ns)    242 ns    285 ns    317 ns
  RegExp w/ unicode             236 ns/iter       (233 ns … 312 ns)    237 ns    263 ns    299 ns
  
  summary for checking any alphanumeric
    unicode-segmenter/general
     1x faster than RegExp w/ unicode
     1.03x faster than XRegExp
  
  • match all alphanumeric
  ----------------------------------------------------------------- -----------------------------
  unicode-segmenter/general   1'883 ns/iter   (1'851 ns … 2'105 ns)  1'880 ns  2'027 ns  2'105 ns
  XRegExp                     3'135 ns/iter   (3'109 ns … 3'300 ns)  3'137 ns  3'273 ns  3'300 ns
  RegExp w/ unicode           1'540 ns/iter   (1'520 ns … 1'655 ns)  1'544 ns  1'643 ns  1'655 ns
  
  summary for match all alphanumeric
    RegExp w/ unicode
     1.22x faster than unicode-segmenter/general
     2.04x faster than XRegExp
  ```

</details>

### `unicode-segmenter/grapheme` vs

- Node.js' [`Intl.Segmenter`] (browser's version may vary)
- [graphemer]@1.4.0 (16.6M+ weekly downloads on NPM)
- [grapheme-splitter]@1.0.4 (5.7M+ weekly downloads on NPM)
- WebAssembly build of the Rust [unicode-segmentation] library
- [@formatjs/intl-segmenter]@11.5.7 (5.4K+ weekly downloads on NPM)

#### Package stats

| Name                         | Unicode® | ESM? |   Size    | Size (min) | Size (min+gzip) | Size (min+br) |
|------------------------------|----------|------|----------:|-----------:|----------------:|--------------:|
| `unicode-segmenter/grapheme` |   15.1.0 |    ✔️ |    33,045 |     29,667 |           9,343 |         5,658 |
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
  unicode-segmenter                             5'564 ns/iter   (5'313 ns … 6'498 ns)  5'616 ns  6'402 ns  6'498 ns
  Intl.Segmenter                               53'754 ns/iter    (47'250 ns … 535 µs) 53'541 ns 90'375 ns    444 µs
  graphemer                                    55'733 ns/iter    (52'125 ns … 240 µs) 55'959 ns 96'625 ns    195 µs
  grapheme-splitter                               119 µs/iter       (114 µs … 287 µs)    120 µs    130 µs    255 µs
  unicode-rs/unicode-segmentation (wasm-pack)  16'906 ns/iter    (16'375 ns … 196 µs) 16'750 ns 18'333 ns 89'292 ns
  @formatjs/intl-segmenter                     43'489 ns/iter    (41'375 ns … 193 µs) 43'166 ns 96'583 ns    163 µs
  
  summary for Lorem ipsum (ascii)
    unicode-segmenter
     3.04x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.82x faster than @formatjs/intl-segmenter
     9.66x faster than Intl.Segmenter
     10.02x faster than graphemer
     21.42x faster than grapheme-splitter
  
  • Emojis
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             1'714 ns/iter   (1'640 ns … 1'912 ns)  1'746 ns  1'901 ns  1'912 ns
  Intl.Segmenter                               14'351 ns/iter  (12'375 ns … 1'095 µs) 13'500 ns 17'875 ns    814 µs
  graphemer                                    14'541 ns/iter    (14'041 ns … 573 µs) 14'334 ns 17'083 ns 76'500 ns
  grapheme-splitter                            27'487 ns/iter    (26'791 ns … 504 µs) 27'084 ns 31'333 ns 55'375 ns
  unicode-rs/unicode-segmentation (wasm-pack)   5'850 ns/iter   (5'740 ns … 6'301 ns)  5'864 ns  6'243 ns  6'301 ns
  @formatjs/intl-segmenter                     15'358 ns/iter    (14'791 ns … 266 µs) 15'125 ns 16'875 ns    127 µs
  
  summary for Emojis
    unicode-segmenter
     3.41x faster than unicode-rs/unicode-segmentation (wasm-pack)
     8.37x faster than Intl.Segmenter
     8.49x faster than graphemer
     8.96x faster than @formatjs/intl-segmenter
     16.04x faster than grapheme-splitter
  
  • Demonic characters
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             1'739 ns/iter   (1'689 ns … 1'911 ns)  1'760 ns  1'910 ns  1'911 ns
  Intl.Segmenter                                5'190 ns/iter   (3'584 ns … 9'258 ns)  8'052 ns  9'240 ns  9'258 ns
  graphemer                                    29'165 ns/iter    (28'125 ns … 362 µs) 28'667 ns 32'583 ns    159 µs
  grapheme-splitter                            20'258 ns/iter    (19'208 ns … 420 µs) 19'750 ns 23'750 ns    285 µs
  unicode-rs/unicode-segmentation (wasm-pack)   2'535 ns/iter   (2'487 ns … 2'743 ns)  2'567 ns  2'696 ns  2'743 ns
  @formatjs/intl-segmenter                     18'082 ns/iter    (17'708 ns … 225 µs) 17'958 ns 19'292 ns 45'666 ns
  
  summary for Demonic characters
    unicode-segmenter
     1.46x faster than unicode-rs/unicode-segmentation (wasm-pack)
     2.98x faster than Intl.Segmenter
     10.4x faster than @formatjs/intl-segmenter
     11.65x faster than grapheme-splitter
     16.77x faster than graphemer
  
  • Tweet text (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             7'996 ns/iter   (7'715 ns … 8'820 ns)  8'094 ns  8'723 ns  8'820 ns
  Intl.Segmenter                               70'478 ns/iter    (64'625 ns … 553 µs) 70'250 ns 81'167 ns    459 µs
  graphemer                                    77'360 ns/iter    (73'875 ns … 355 µs) 77'459 ns 95'000 ns    285 µs
  grapheme-splitter                               149 µs/iter       (142 µs … 482 µs)    148 µs    167 µs    429 µs
  unicode-rs/unicode-segmentation (wasm-pack)  25'263 ns/iter    (24'625 ns … 241 µs) 25'042 ns 26'875 ns    151 µs
  @formatjs/intl-segmenter                     69'504 ns/iter    (67'042 ns … 840 µs) 67'834 ns 80'625 ns    290 µs
  
  summary for Tweet text (combined)
    unicode-segmenter
     3.16x faster than unicode-rs/unicode-segmentation (wasm-pack)
     8.69x faster than @formatjs/intl-segmenter
     8.81x faster than Intl.Segmenter
     9.67x faster than graphemer
     18.67x faster than grapheme-splitter
  
  • Code snippet (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                            18'587 ns/iter    (17'833 ns … 211 µs) 18'250 ns 19'833 ns    136 µs
  Intl.Segmenter                                  158 µs/iter       (150 µs … 382 µs)    160 µs    309 µs    348 µs
  graphemer                                       182 µs/iter     (176 µs … 1'176 µs)    181 µs    304 µs    399 µs
  grapheme-splitter                               349 µs/iter       (337 µs … 666 µs)    348 µs    451 µs    620 µs
  unicode-rs/unicode-segmentation (wasm-pack)  60'947 ns/iter    (58'333 ns … 308 µs) 60'792 ns 69'500 ns    242 µs
  @formatjs/intl-segmenter                        159 µs/iter       (155 µs … 387 µs)    156 µs    277 µs    354 µs
  
  summary for Code snippet (combined)
    unicode-segmenter
     3.28x faster than unicode-rs/unicode-segmentation (wasm-pack)
     8.51x faster than Intl.Segmenter
     8.56x faster than @formatjs/intl-segmenter
     9.8x faster than graphemer
     18.78x faster than grapheme-splitter
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
