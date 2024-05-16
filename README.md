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

## Compatibility

`unicode-segmenter` uses most basic ES6+ features like [generators](https://caniuse.com/es6-generators), [modules](https://caniuse.com/es6-module) and [`String.prototype.codePointAt()`](https://caniuse.com/mdn-javascript_builtins_string_codepointat).

Those are available in (not very) modern browsers as well as lightweight runtimes like [QuickJS](https://bellard.org/quickjs/). You can still use the library even in IE11 after transpile/polyfilling them using.

## Usage

### Using TypeScript

No worry. The project is fully type-checked, and provides `*.d.ts` for you 😉

### Export `unicode-segmenter/emoji`
[![](https://edge.bundlejs.com/badge?q=unicode-segmenter/emoji&treeshake=[*])](https://bundlejs.com/?q=unicode-segmenter%2Femoji&treeshake=%5B*%5D)

Utilities for matching emoji-like characters

#### Example: Use Unicode emoji property matches

```js
import {
  isEmoji,             // match \p{Extended_Pictographic}
  isEmojiPresentation, // match \p{Emoji_Presentation}
} from 'unicode-segmenter/emoji';

isEmoji('😍'.codePointAt(0));
// => true
isEmoji('♡'.codePointAt(0));
// => true

isEmojiPresentation('😍'.codePointAt(0));
// => true
isEmojiPresentation('♡'.codePointAt(0));
// => false
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
import * as assert from 'node:assert/strict';
import { countGrapheme } from 'unicode-segmenter/grapheme';

assert.equal('👋 안녕!'.length, 6);
assert.equal(countGrapheme('👋 안녕!'), 5);

assert.equal('a̐éö̲'.length, 7);
assert.equal(countGrapheme('a̐éö̲'), 3);
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
  const codePoint = surrogatePairToCodePoint(hi, lo); // equivalent to u32.codePointAt(0)
}
```

#### Example: Take a UTF-8 character from a JS string

```js
import {
  takeChar,
  takeCodePoint,
} from 'unicode-segmenter/utils';

const str = '😍♡😍'; // .length = 5

let ch = '';
let cursor = 0;

ch = takeChar(str, cursor);              // => '😍'
ch = takeChar(str, cursor += ch.length); // => '♡'
ch = takeChar(str, cursor += ch.length); // => '😍'

// `takeCodePoint` does same, but returns Unicode code point
```

## Benchmarks

`unicode-segmenter` aims to be lighter and faster than alternatives in the ecosystem while fully spec compliant. So the benchmark is tracking the performance, bundle size, and Unicode version compliance of several libraries.

Look [benchmark](benchmark) to see how it works.

### `unicode-segmenter/emoji` vs

- built-in Unicode `RegExp`
- [emoji-regex]@10.3.0 (101M+ weekly downloads on NPM)

#### Package stats

| Name                      | Unicode®      | ESM? | Size    | Size (min) | Size (min+gzip) | Size (min+br) |
|---------------------------|---------------|------|--------:|-----------:|----------------:|--------------:|
| `unicode-segmenter/emoji` | 15.1.0        |    ✔️ |   3,058 |      2,611 |           1,041 |           751 |
| `emoji-regex`*            | 15.1.0 (vary) |    ✔️ |  12,946 |     12,859 |           2,180 |         1,746 |
| `RegExp` w/ `u`*          |             - |    - |       0 |          0 |               0 |             0 |

* `emoji-regex` only supports `Emoji_Presentation` property, not `Extended_Pictographic`.
* You can build your own `emoji-regex` using [emoji-test-regex-pattern](https://github.com/mathiasbynens/emoji-test-regex-pattern).
* `RegExp` Unicode data is always kept up to date as the runtime support.
* `RegExp` Unicode may not be available in [some old browsers](https://caniuse.com/mdn-javascript_builtins_regexp_unicode), edge runtimes, or embedded environments.

#### Runtime performance

The runtime performance of `unicode-segmenter/emoji` is enough to test the presence of emoji in a text.

It's \~2.5x worse than `RegExp` w/ `u` for match-all performance, but that's useless examples in the real world because others don't care about grapheme clusters.

<details>
  <summary>Details</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v20.13.1 (arm64-darwin)
  
  benchmark                    time (avg)             (min … max)       p75       p99      p999
  --------------------------------------------------------------- -----------------------------
  • checking if any emoji
  --------------------------------------------------------------- -----------------------------
  unicode-segmenter/emoji   16.11 ns/iter     (15.28 ns … 339 ns)  16.32 ns  18.66 ns  43.42 ns
  RegExp w/ unicode         19.03 ns/iter     (16.52 ns … 185 ns)   17.9 ns  46.28 ns  74.85 ns
  emoji-regex               43.15 ns/iter   (41.54 ns … 73.51 ns)  43.58 ns  47.93 ns  65.73 ns
  
  summary for checking if any emoji
    unicode-segmenter/emoji
     1.18x faster than RegExp w/ unicode
     2.68x faster than emoji-regex
  
  • match all emoji
  --------------------------------------------------------------- -----------------------------
  unicode-segmenter/emoji   3'215 ns/iter     (2'958 ns … 189 µs)  3'208 ns  3'708 ns 11'833 ns
  RegExp w/ unicode         1'285 ns/iter   (1'221 ns … 1'509 ns)  1'299 ns  1'449 ns  1'509 ns
  emoji-regex              11'696 ns/iter    (11'125 ns … 239 µs) 11'667 ns 16'125 ns 20'375 ns
  
  summary for match all emoji
    unicode-segmenter/emoji
     2.5x slower than RegExp w/ unicode
     3.64x faster than emoji-regex
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

#### Package stats

| Name                         | Unicode® | ESM? |   Size    | Size (min) | Size (min+gzip) | Size (min+br) |
|------------------------------|----------|------|----------:|-----------:|----------------:|--------------:|
| `unicode-segmenter/grapheme` |   15.1.0 |    ✔️ |    33,045 |     29,667 |           9,343 |         5,658 |
| `graphemer`                  |   15.0.0 |    ✖️ ️|   410,424 |     95,104 |          15,752 |        10,660 |
| `grapheme-splitter`          |   10.0.0 |    ✖️ |   122,241 |     23,680 |           7,852 |         4,841 |
| `unicode-segmentation`*      |   15.0.0 |    ✔️ |    51,251 |     51,251 |          22,545 |        16,614 |
| `Intl.Segmenter`*            |        - |    - |         0 |          0 |               0 |             0 |

* `unicode-segmentation` size contains only the minimum WASM binary. It will be larger by adding more bindings.
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
  unicode-segmenter                             5'307 ns/iter     (4'708 ns … 252 µs)  5'125 ns  6'250 ns 68'625 ns
  Intl.Segmenter                               51'373 ns/iter    (47'000 ns … 467 µs) 50'709 ns 58'583 ns    397 µs
  graphemer                                    49'735 ns/iter  (46'416 ns … 1'739 µs) 47'042 ns    123 µs    342 µs
  grapheme-splitter                            74'459 ns/iter    (73'292 ns … 211 µs) 73'834 ns 81'334 ns    169 µs
  unicode-rs/unicode-segmentation (wasm-pack)  16'422 ns/iter    (15'625 ns … 325 µs) 16'375 ns 19'416 ns 89'125 ns
  
  summary for Lorem ipsum (ascii)
    unicode-segmenter
     3.09x faster than unicode-rs/unicode-segmentation (wasm-pack)
     9.37x faster than graphemer
     9.68x faster than Intl.Segmenter
     14.03x faster than grapheme-splitter
  
  • Emojis
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             1'820 ns/iter   (1'730 ns … 2'428 ns)  1'853 ns  2'228 ns  2'428 ns
  Intl.Segmenter                               14'743 ns/iter  (12'166 ns … 2'454 µs) 13'875 ns 18'000 ns 39'834 ns
  graphemer                                    13'406 ns/iter  (12'625 ns … 1'243 µs) 13'292 ns 15'208 ns    117 µs
  grapheme-splitter                            27'827 ns/iter    (26'625 ns … 513 µs) 27'709 ns 32'208 ns 82'958 ns
  unicode-rs/unicode-segmentation (wasm-pack)   5'591 ns/iter   (5'462 ns … 5'916 ns)  5'655 ns  5'845 ns  5'916 ns
  
  summary for Emojis
    unicode-segmenter
     3.07x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.37x faster than graphemer
     8.1x faster than Intl.Segmenter
     15.29x faster than grapheme-splitter
  
  • Demonic characters
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             1'789 ns/iter   (1'728 ns … 1'945 ns)  1'812 ns  1'905 ns  1'945 ns
  Intl.Segmenter                                5'083 ns/iter   (3'505 ns … 9'451 ns)  7'867 ns  9'238 ns  9'451 ns
  graphemer                                    27'906 ns/iter    (26'375 ns … 284 µs) 27'750 ns 30'917 ns    168 µs
  grapheme-splitter                            20'428 ns/iter    (19'042 ns … 373 µs) 20'125 ns 23'833 ns    287 µs
  unicode-rs/unicode-segmentation (wasm-pack)   2'513 ns/iter   (2'426 ns … 2'728 ns)  2'542 ns  2'693 ns  2'728 ns
  
  summary for Demonic characters
    unicode-segmenter
     1.4x faster than unicode-rs/unicode-segmentation (wasm-pack)
     2.84x faster than Intl.Segmenter
     11.42x faster than grapheme-splitter
     15.6x faster than graphemer
  
  • Tweet text (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             8'170 ns/iter     (7'666 ns … 370 µs)  8'042 ns  9'125 ns    110 µs
  Intl.Segmenter                               67'951 ns/iter    (63'542 ns … 664 µs) 67'875 ns 73'667 ns    359 µs
  graphemer                                    68'831 ns/iter    (66'542 ns … 349 µs) 69'083 ns 78'500 ns    197 µs
  grapheme-splitter                               151 µs/iter       (145 µs … 624 µs)    150 µs    183 µs    445 µs
  unicode-rs/unicode-segmentation (wasm-pack)  24'231 ns/iter    (23'625 ns … 252 µs) 24'000 ns 26'250 ns    133 µs
  
  summary for Tweet text (combined)
    unicode-segmenter
     2.97x faster than unicode-rs/unicode-segmentation (wasm-pack)
     8.32x faster than Intl.Segmenter
     8.42x faster than graphemer
     18.43x faster than grapheme-splitter
  
  • Code snippet (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                            19'604 ns/iter    (18'291 ns … 239 µs) 19'375 ns 27'709 ns    139 µs
  Intl.Segmenter                                  160 µs/iter       (148 µs … 406 µs)    159 µs    309 µs    385 µs
  graphemer                                       165 µs/iter       (159 µs … 377 µs)    165 µs    267 µs    351 µs
  grapheme-splitter                               353 µs/iter     (340 µs … 1'264 µs)    354 µs    541 µs  1'136 µs
  unicode-rs/unicode-segmentation (wasm-pack)  58'236 ns/iter    (55'958 ns … 905 µs) 58'333 ns 65'125 ns    199 µs
  
  summary for Code snippet (combined)
    unicode-segmenter
     2.97x faster than unicode-rs/unicode-segmentation (wasm-pack)
     8.16x faster than Intl.Segmenter
     8.39x faster than graphemer
     17.98x faster than grapheme-splitter
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
