# unicode-segmenter
[![Package Version](https://img.shields.io/npm/v/unicode-segmenter)](https://npm.im/unicode-segmenter)
[![Integration](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml/badge.svg)](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/cometkim/unicode-segmenter/graph/badge.svg?token=3rA29JEH4J)](https://codecov.io/gh/cometkim/unicode-segmenter)
[![LICENSE - MIT](https://img.shields.io/github/license/cometkim/unicode-segmenter)](#license)

A lightweight and fast, pure JavaScript library for Unicode segmentation.

## Features

The library includes utilities to deal with:
- Emojis and pictographic [⤵](#export-unicode-segmenteremoji)
- Extended grapheme clusters [⤵](#export-unicode-segmentergrapheme)
- Non-Latin alphabets and numbers [⤵](#export-unicode-segmentergeneral)
- UTF-8 characters and UTF-16 surrogates [⤵](#export-unicode-segmenterutils)
- Polyfill [`Intl.Segmenter`] API [⤵](#export-unicode-segmenterintl-adapter)

With no dependencies, so you can use it even in places where built-in Unicode libraries aren't available, such as old browsers, edge runtimes, and embedded environments.

## Unicode® version

Unicode® 15.1.0 Standard [Annex \#29 Revision 43](https://www.unicode.org/reports/tr29/tr29-43.html) (2023-08-16)

## Usage

### Using TypeScript

No worry. Library is fully typed, and provides `*.d.ts` for you 😉

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

This library aims to be lighter and faster than alternatives in the ecosystem.

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
| `unicode-segmenter/grapheme` |   15.1.0 |    ✔️ |    33,594 |     29,915 |           9,454 |         5,776 |
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
  unicode-segmenter                             5'529 ns/iter     (5'166 ns … 188 µs)  5'334 ns  5'917 ns 50'584 ns
  Intl.Segmenter                               50'420 ns/iter    (46'584 ns … 564 µs) 49'916 ns 57'667 ns    317 µs
  graphemer                                    49'188 ns/iter    (46'833 ns … 395 µs) 47'959 ns 99'583 ns    221 µs
  grapheme-splitter                            74'743 ns/iter    (73'292 ns … 229 µs) 73'917 ns 80'833 ns    192 µs
  unicode-rs/unicode-segmentation (wasm-pack)  16'130 ns/iter    (15'625 ns … 292 µs) 16'000 ns 17'083 ns 86'042 ns
  
  summary for Lorem ipsum (ascii)
    unicode-segmenter
     2.92x faster than unicode-rs/unicode-segmentation (wasm-pack)
     8.9x faster than graphemer
     9.12x faster than Intl.Segmenter
     13.52x faster than grapheme-splitter
  
  • Emojis
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             1'693 ns/iter   (1'662 ns … 1'804 ns)  1'711 ns  1'787 ns  1'804 ns
  Intl.Segmenter                               14'306 ns/iter  (12'209 ns … 1'277 µs) 13'500 ns 17'542 ns    776 µs
  graphemer                                    13'101 ns/iter    (12'542 ns … 596 µs) 12'875 ns 15'417 ns    109 µs
  grapheme-splitter                            27'259 ns/iter    (26'583 ns … 508 µs) 26'875 ns 31'500 ns 59'917 ns
  unicode-rs/unicode-segmentation (wasm-pack)   5'590 ns/iter   (5'471 ns … 6'420 ns)  5'609 ns  6'361 ns  6'420 ns
  
  summary for Emojis
    unicode-segmenter
     3.3x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.74x faster than graphemer
     8.45x faster than Intl.Segmenter
     16.1x faster than grapheme-splitter
  
  • Demonic characters
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             1'742 ns/iter   (1'686 ns … 1'874 ns)  1'767 ns  1'867 ns  1'874 ns
  Intl.Segmenter                                5'070 ns/iter   (3'498 ns … 9'027 ns)  8'009 ns  8'877 ns  9'027 ns
  graphemer                                    27'235 ns/iter  (26'250 ns … 1'753 µs) 26'750 ns 29'416 ns    168 µs
  grapheme-splitter                            19'988 ns/iter    (19'000 ns … 417 µs) 19'500 ns 24'000 ns    269 µs
  unicode-rs/unicode-segmentation (wasm-pack)   2'518 ns/iter   (2'440 ns … 2'734 ns)  2'550 ns  2'641 ns  2'734 ns
  
  summary for Demonic characters
    unicode-segmenter
     1.45x faster than unicode-rs/unicode-segmentation (wasm-pack)
     2.91x faster than Intl.Segmenter
     11.48x faster than grapheme-splitter
     15.64x faster than graphemer
  
  • Tweet text (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             8'791 ns/iter     (8'125 ns … 268 µs)  8'750 ns  9'792 ns    122 µs
  Intl.Segmenter                               72'326 ns/iter    (63'583 ns … 680 µs) 71'875 ns    111 µs    557 µs
  graphemer                                    72'033 ns/iter    (66'791 ns … 357 µs) 71'875 ns    110 µs    300 µs
  grapheme-splitter                               154 µs/iter       (147 µs … 501 µs)    157 µs    194 µs    480 µs
  unicode-rs/unicode-segmentation (wasm-pack)  24'444 ns/iter    (23'666 ns … 355 µs) 24'083 ns 27'542 ns    179 µs
  
  summary for Tweet text (combined)
    unicode-segmenter
     2.78x faster than unicode-rs/unicode-segmentation (wasm-pack)
     8.19x faster than graphemer
     8.23x faster than Intl.Segmenter
     17.55x faster than grapheme-splitter
  
  • Code snippet (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                            20'311 ns/iter    (19'541 ns … 220 µs) 19'958 ns 23'375 ns    129 µs
  Intl.Segmenter                                  170 µs/iter     (151 µs … 1'633 µs)    161 µs    513 µs  1'282 µs
  graphemer                                       163 µs/iter       (159 µs … 410 µs)    161 µs    286 µs    367 µs
  grapheme-splitter                               352 µs/iter       (346 µs … 710 µs)    350 µs    463 µs    672 µs
  unicode-rs/unicode-segmentation (wasm-pack)  57'798 ns/iter    (56'083 ns … 326 µs) 57'208 ns 63'625 ns    203 µs
  
  summary for Code snippet (combined)
    unicode-segmenter
     2.85x faster than unicode-rs/unicode-segmentation (wasm-pack)
     8.04x faster than graphemer
     8.37x faster than Intl.Segmenter
     17.34x faster than grapheme-splitter
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
