# unicode-segmenter
[![Package Version](https://img.shields.io/npm/v/unicode-segmenter)](https://npm.im/unicode-segmenter)
[![Integration](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml/badge.svg)](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/cometkim/unicode-segmenter/graph/badge.svg?token=3rA29JEH4J)](https://codecov.io/gh/cometkim/unicode-segmenter)
[![LICENSE - MIT](https://img.shields.io/github/license/cometkim/unicode-segmenter)](#license)

A lightweight and fast, pure JavaScript library for Unicode segmentation.

Including utilities to deal with **Extended Grapheme Clusters**, **Emojis**, **Unicode letters**, **Unicode numbers**, **UTF-8** characters and more!

## Unicode® version

Unicode® 15.1.0 (2023 September 12)

- https://www.unicode.org/versions/Unicode15.1.0/

Unicode® Standard Annex #29 Revision 43 (2023-08-16)

- https://www.unicode.org/reports/tr29/tr29-43.html

## Usage

### Using TypeScript

No worry. Library is fully typed, and provides `*.d.ts` for you 😉

### Export `unicode-segmenter/emoji`
[![](https://edge.bundlejs.com/badge?q=unicode-segmenter/emoji&treeshake=[*])](https://bundlejs.com/?q=unicode-segmenter%2Femoji&treeshake=%5B*%5D)

#### Example: Use Unicode emoji property matchers

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

You can access some internal utilities to deal with UTF-8 in string

#### Example: Handle surrogate pairs

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

#### Example: Take UTF-8 character from a JS string

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

This library aims to be lighter and faster than other existing Unicode libraries in the ecosystem.

Look [benchmark](benchmark) to see how it works.

### `unicode-segmenter/emoji` vs

- built-in Unicode RegExp
- [emoji-regex]@10.3.0 (101M+ weekly downloads on NPM)

#### Package stats

| Name                      | Unicode®      | ESM? | Size    | Size (min) | Size (min+gzip) | Size (min+br) |
|---------------------------|--------------:|------|--------:|-----------:|----------------:|--------------:|
| `unicode-segmenter/emoji` | 15.1.0        |    ✔️ |   3,058 |      2,611 |           1,041 |           751 |
| `emoji-regex`*            | 15.1.0 (vary) |    ✔️ |  12,946 |     12,859 |           2,180 |         1,746 |
| `RegExp` w/ `u`*          |             - |    - |       0 |          0 |               0 |             0 |

* `emoji-regex` only supports `Emoji_Presentation` property, not `Extended_Pictographic`.
* You can build your own `emoji-regex` using [emoji-test-regex-pattern](https://github.com/mathiasbynens/emoji-test-regex-pattern).
* `RegExp` Unicode data is always kept up to date as the runtime support.
* `RegExp` Unicode may not be available in [some old browsers](https://caniuse.com/mdn-javascript_builtins_regexp_unicode), edge runtimes, or embedded environments.

#### Runtime performance

The runtime performance of `unicode-segmenter/emoji` is enough to test the presence of emoji in a text.

It's \~2.5x worse than RegExp w/ `u` for match-all performance, but that's useless examples in the real world because others don't care about grapheme clusters.

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

- built-in unicode RegExp

#### Package stats

| Name                        | Unicode® | ESM? | Size    | Size (min) | Size (min+gzip) | Size (min+br) |
|-----------------------------|---------:|------|--------:|-----------:|----------------:|--------------:|
| `unicode-segmenter/general` |   15.1.0 |    ✔️ |  21,505 |     20,972 |           5,792 |         3,564 |
| `RegExp` w/ `u`*            |        - |    - |       0 |          0 |               0 |             0 |

* `RegExp` Unicode data is always kept up to date as the runtime support.
* `RegExp` Unicode may not be available in [some old browsers](https://caniuse.com/mdn-javascript_builtins_regexp_unicode), edge runtimes, or embedded environments.

#### Runtime performance

`unicode-segmenter/general` is almost equivalent to RegExp w/ `u`.

<details>
  <summary>Details</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v20.13.1 (arm64-darwin)
  
  benchmark                      time (avg)             (min … max)       p75       p99      p999
  ----------------------------------------------------------------- -----------------------------
  • checking any alphanumeric
  ----------------------------------------------------------------- -----------------------------
  unicode-segmenter/general     236 ns/iter       (228 ns … 599 ns)    240 ns    311 ns    453 ns
  RegExp w/ unicode             235 ns/iter       (233 ns … 285 ns)    235 ns    256 ns    271 ns
  
  summary for checking any alphanumeric
    RegExp w/ unicode
     1x faster than unicode-segmenter/general
  
  • match all alphanumeric
  ----------------------------------------------------------------- -----------------------------
  unicode-segmenter/general   2'480 ns/iter   (2'439 ns … 2'779 ns)  2'477 ns  2'736 ns  2'779 ns
  RegExp w/ unicode           2'304 ns/iter   (2'076 ns … 7'742 ns)  2'110 ns  7'097 ns  7'742 ns
  
  summary for match all alphanumeric
    RegExp w/ unicode
     1.08x faster than unicode-segmenter/general
  ```

</details>

### `unicode-segmenter/grapheme` vs

- Node.js' [`Intl.Segmenter`] (browser's version may vary)
- [graphemer]@1.4.0 (16.6M+ weekly downloads on NPM)
- [grapheme-splitter]@1.0.4 (5.7M+ weekly downloads on NPM)
- WebAssembly build of the Rust [unicode-segmentation] library

#### Package stats

| Name                         | Unicode® | ESM? |   Size    | Size (min) | Size (min+gzip) | Size (min+br) |
|------------------------------|---------:|------|----------:|-----------:|----------------:|--------------:|
| `unicode-segmenter/grapheme` |   15.1.0 |    ✔️ |    35,364 |     30,743 |           9,562 |         5,843 |
| `graphemer`                  |   15.0.0 |    ✖️ ️|   410,424 |     95,104 |          15,752 |        10,660 |
| `grapheme-splitter`          |   10.0.0 |    ✖️ |   122,241 |     23,680 |           7,852 |         4,841 |
| `unicode-segmentation`*      |   15.0.0 |    ✔️ |    51,251 |     51,251 |          22,545 |        16,614 |
| `Intl.Segmenter`*            |        - |    - |         0 |          0 |               0 |             0 |

* `unicode-segmentation` size contains only the minimum WASM binary. It will be larger by adding more bindings.
* `Intl.Segmenter`'s Unicode data is always kept up to date as the runtime support.
* `Intl.Segmenter` may not be available in [some old browsers](https://caniuse.com/mdn-javascript_builtins_intl_segmenter), edge runtimes, or embedded environments.

#### Runtime performance

`unicode-segmenter/grapheme` is 7\~15x faster than JS alternatives (including the native [`Intl.Segmenter`]), and 1.5\~3x faster than WASM build of the Rust [unicode-segmentation] library.

The gap becomes larger depending on the environment. On Intel(x64) Linux machines it measures 8\~20x.

<details>
  <summary>Details</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v20.13.1 (arm64-darwin)
  
  benchmark                                        time (avg)             (min … max)       p75       p99      p999
  ----------------------------------------------------------------------------------- -----------------------------
  • Lorem ipsum (ascii)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             6'670 ns/iter     (5'666 ns … 396 µs)  6'167 ns 17'791 ns    105 µs
  Intl.Segmenter                               55'211 ns/iter  (47'792 ns … 1'597 µs) 53'542 ns    101 µs    520 µs
  graphemer                                    48'277 ns/iter    (46'666 ns … 228 µs) 47'500 ns 86'083 ns    133 µs
  grapheme-splitter                            76'829 ns/iter    (73'291 ns … 947 µs) 76'208 ns    119 µs    364 µs
  unicode-rs/unicode-segmentation (wasm-pack)  16'807 ns/iter  (15'625 ns … 1'507 µs) 16'583 ns 19'125 ns    142 µs
  
  summary for Lorem ipsum (ascii)
    unicode-segmenter
     2.52x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.24x faster than graphemer
     8.28x faster than Intl.Segmenter
     11.52x faster than grapheme-splitter
  
  • Emojis
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             2'084 ns/iter     (1'875 ns … 288 µs)  2'042 ns  2'542 ns  7'000 ns
  Intl.Segmenter                               14'598 ns/iter  (12'250 ns … 2'316 µs) 13'792 ns 17'500 ns 37'875 ns
  graphemer                                    13'421 ns/iter  (12'666 ns … 1'454 µs) 13'250 ns 16'250 ns    119 µs
  grapheme-splitter                            27'685 ns/iter    (26'625 ns … 526 µs) 27'500 ns 32'875 ns 72'625 ns
  unicode-rs/unicode-segmentation (wasm-pack)   5'573 ns/iter   (5'456 ns … 5'897 ns)  5'605 ns  5'894 ns  5'897 ns
  
  summary for Emojis
    unicode-segmenter
     2.67x faster than unicode-rs/unicode-segmentation (wasm-pack)
     6.44x faster than graphemer
     7x faster than Intl.Segmenter
     13.28x faster than grapheme-splitter
  
  • Demonic characters
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             1'931 ns/iter   (1'875 ns … 2'076 ns)  1'951 ns  2'048 ns  2'076 ns
  Intl.Segmenter                                5'125 ns/iter   (3'593 ns … 9'140 ns)  7'806 ns  9'134 ns  9'140 ns
  graphemer                                    27'466 ns/iter  (26'375 ns … 1'089 µs) 27'041 ns 29'750 ns    167 µs
  grapheme-splitter                            20'170 ns/iter  (19'041 ns … 1'045 µs) 19'500 ns 22'917 ns    280 µs
  unicode-rs/unicode-segmentation (wasm-pack)   2'473 ns/iter   (2'427 ns … 2'819 ns)  2'486 ns  2'708 ns  2'819 ns
  
  summary for Demonic characters
    unicode-segmenter
     1.28x faster than unicode-rs/unicode-segmentation (wasm-pack)
     2.65x faster than Intl.Segmenter
     10.44x faster than grapheme-splitter
     14.22x faster than graphemer
  
  • Tweet text (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                             9'102 ns/iter   (8'947 ns … 9'563 ns)  9'125 ns  9'526 ns  9'563 ns
  Intl.Segmenter                               67'567 ns/iter    (63'792 ns … 488 µs) 67'750 ns 77'375 ns    372 µs
  graphemer                                    70'328 ns/iter    (66'584 ns … 428 µs) 69'542 ns    102 µs    308 µs
  grapheme-splitter                               149 µs/iter       (146 µs … 491 µs)    148 µs    166 µs    445 µs
  unicode-rs/unicode-segmentation (wasm-pack)  24'484 ns/iter    (23'625 ns … 313 µs) 24'125 ns 27'833 ns    140 µs
  
  summary for Tweet text (combined)
    unicode-segmenter
     2.69x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.42x faster than Intl.Segmenter
     7.73x faster than graphemer
     16.39x faster than grapheme-splitter
  
  • Code snippet (combined)
  ----------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                            22'201 ns/iter    (21'083 ns … 756 µs) 21'500 ns 25'375 ns    179 µs
  Intl.Segmenter                                  160 µs/iter       (148 µs … 370 µs)    160 µs    304 µs    356 µs
  graphemer                                       165 µs/iter       (159 µs … 419 µs)    165 µs    277 µs    358 µs
  grapheme-splitter                               355 µs/iter       (342 µs … 626 µs)    358 µs    467 µs    615 µs
  unicode-rs/unicode-segmentation (wasm-pack)  58'552 ns/iter    (55'709 ns … 349 µs) 58'583 ns 66'959 ns    243 µs
  
  summary for Code snippet (combined)
    unicode-segmenter
     2.64x faster than unicode-rs/unicode-segmentation (wasm-pack)
     7.21x faster than Intl.Segmenter
     7.44x faster than graphemer
     15.99x faster than grapheme-splitter
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
