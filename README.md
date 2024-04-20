# unicode-segmenter
[![Package Version](https://img.shields.io/npm/v/unicode-segmenter)](https://npm.im/unicode-segmenter)
[![Integration](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml/badge.svg)](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/cometkim/unicode-segmenter/graph/badge.svg?token=3rA29JEH4J)](https://codecov.io/gh/cometkim/unicode-segmenter)
[![LICENSE - MIT](https://img.shields.io/github/license/cometkim/unicode-segmenter)](#license)

A lightweight and fast, pure JavaScript library for Unicode segmentation.

> [!NOTE]
> The initial implementation was ported manually from Rust's [unicode-segmentation] library, which is licenced under the [MIT](licenses/unicode-segmentation_MIT.txt) license.

## Unicode® version

15.1.0 (2023 September 12)

- https://www.unicode.org/versions/Unicode15.1.0/
- https://www.unicode.org/Public/15.1.0/

## Usage

You can find most of usecases from [test](test) and [benchmark](benchmark) directory!

### Examples

Count graphemes:

```js
import * as assert from 'node:assert/strict';
import { countGrapheme } from 'unicode-segmenter/grapheme';

assert.equal('👋 안녕!', 6);
assert.equal(countGrapheme('👋 안녕!'), 5);

assert.equal('a̐éö̲'.length, 7);
assert.equal(countGrapheme('a̐éö̲'), 3);
```

Get grapheme segments:

```js
import { graphemeSegments, GraphemeCategory } from 'unicode-segmenter/grapheme';

[...graphemeSegments('a̐éö̲')];
// 0: { segment: 'a̐', index: 0, input: 'a̐éö̲\r\n' },
// 1: { segment: 'é', index: 2, input: 'a̐éö̲\r\n' },
// 2: { segment: 'ö̲', index: 4, input: 'a̐éö̲\r\n' },
```

Make an advanced grapheme matcher:

```js
import { graphemeSegments, GraphemeCategory } from 'unicode-segmenter/grapheme';

function* matchEmoji(str) {
  // internal field `_cat` is GraphemeCategory value of the match index
  for (const { index, segment, _cat } of graphemeSegments(input)) {
    if (_cat === GraphemeCategory.Extended_Pictographic) {
      yield { emoji: segment, index };
    }
  }
}
```

Use Unicode general property matchers:

```js
import {
  isLetter,       // match w/ \p{L}
  isNumeric,      // match w/ \p{N}
  isAlphabetic,   // match w/ \p{Alphabetic}
  isAlphanumeric, // match w/ [\p{N}\p{Alphabetic}]
} from 'unicode-segmenter/general';
```

Use Unicode emoji property matchers:

```js
import {
  isEmoji,             // match w/ \p{Extended_Pictographic}
  isEmojiPresentation, // match w/ \p{Emoji_Presentation}
} from 'unicode-segmenter/emoji';
```

Use [`Intl.Segmenter`] adapter (only `granularity: "grapheme"` available):

```js
import { Segmenter } from 'unicode-segmenter/intl-adapter';

// Same API with the `Intl.Segmenter`
const segmenter = new Segmenter();
```

Use [`Intl.Segmenter`] polyfill (only `granularity: "grapheme"` available):

```js
// Apply polyfill to the `globalThis.Intl` object.
import 'unicode-segmenter/intl-polyfill';

const segmenter = new Intl.Segmenter();
```

### TypeScript

No worry. Library is fully typed, and provides `*.d.ts` file for you 😉

## Library benchmarks

This library aims to be lighter and faster than other existing Unicode libraries in the ecosystem.

Look [benchmark](benchmark) to see how it works.

### `unicode-segmenter/emoji` vs

- built-in Unicode RegExp
- [emoji-regex]@10.3.0 (101M+ weekly downloads on NPM)

<details open>
  <summary>Bundle stats</summary>

  | Name                        | ESM? | Size    | Size (min)       | Size (min+gzip)  | Size (min+br)    |
  |-----------------------------|------|--------:|-----------------:|-----------------:|-----------------:|
  | `unicode-segmenter/emoji`   |    ✔️ |   3,058 |            2,611 |            1,041 |              751 |
  | `emoji-regex`               |    ✔️ |  12,946 |           12,859 |            2,180 |            1,746 |

</details>

Runtime performance of `unicode-segmenter/emoji` is a bit less than RegEx w/ `u`, but is best in alternatives.

<details>
  <summary>Details</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v21.7.1 (arm64-darwin)
  
  benchmark                    time (avg)             (min … max)       p75       p99      p999
  --------------------------------------------------------------- -----------------------------
  • checking if any emoji
  --------------------------------------------------------------- -----------------------------
  unicode-segmenter/emoji   98.11 ns/iter     (94.54 ns … 454 ns)  99.81 ns    120 ns    203 ns
  RegExp w/ unicode         34.42 ns/iter        (32 ns … 176 ns)  34.12 ns   59.9 ns   83.6 ns
  emoji-regex              error: not match
  
  summary for checking if any emoji
    RegExp w/ unicode
     2.85x faster than unicode-segmenter/emoji
  
  • match all emoji
  --------------------------------------------------------------- -----------------------------
  unicode-segmenter/emoji   2'197 ns/iter   (2'171 ns … 2'401 ns)  2'198 ns  2'295 ns  2'401 ns
  RegExp w/ unicode         1'805 ns/iter   (1'784 ns … 2'051 ns)  1'806 ns  1'984 ns  2'051 ns
  emoji-regex              11'824 ns/iter    (11'458 ns … 116 µs) 11'916 ns 12'833 ns 41'875 ns
  
  summary for match all emoji
    RegExp w/ unicode
     1.22x faster than unicode-segmenter/emoji
     6.55x faster than emoji-regex
  ```

</details>

### `unicode-segmenter/general` vs

- built-in unicode RegExp

<details open>
  <summary>Bundle stats</summary>

  | Name                        | ESM? | Size    | Size (min)       | Size (min+gzip)  | Size (min+br)    |
  |-----------------------------|------|--------:|-----------------:|-----------------:|-----------------:|
  | `unicode-segmenter/general` |    ✔️ |  21,505 |           20,972 |            5,792 |            3,564 |

</details>

`unicode-segmenter/general` is almost equivalent to RegExp w/ `u`.

<details>
  <summary>Details</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v21.7.1 (arm64-darwin)
  
  benchmark                      time (avg)             (min … max)       p75       p99      p999
  ----------------------------------------------------------------- -----------------------------
  • checking any alphanumeric
  ----------------------------------------------------------------- -----------------------------
  unicode-segmenter/general     229 ns/iter       (222 ns … 529 ns)    232 ns    289 ns    485 ns
  RegExp w/ unicode             238 ns/iter       (233 ns … 314 ns)    240 ns    267 ns    301 ns
  
  summary for checking any alphanumeric
    unicode-segmenter/general
     1.04x faster than RegExp w/ unicode
  
  • match all alphanumeric
  ----------------------------------------------------------------- -----------------------------
  unicode-segmenter/general   2'649 ns/iter   (2'490 ns … 4'802 ns)  2'654 ns  4'419 ns  4'802 ns
  RegExp w/ unicode           2'032 ns/iter   (2'017 ns … 2'168 ns)  2'041 ns  2'097 ns  2'168 ns
  
  summary for match all alphanumeric
    RegExp w/ unicode
     1.3x faster than unicode-segmenter/general
  ```

</details>

### `unicode-segmenter/grapheme` vs

- Node.js' [`Intl.Segmenter`] (browser's version may vary)
- [graphemer]@1.4.0 (16.6M+ weekly downloads on NPM)
- [grapheme-splitter]@1.0.4 (5.7M+ weekly downloads on NPM)

<details open>
  <summary>Bundle stats</summary>

  | Name                         | ESM? | Size    | Size (min)       | Size (min+gzip)  | Size (min+br)    |
  |------------------------------|------|--------:|-----------------:|-----------------:|-----------------:|
  | `unicode-segmenter/grapheme` |    ✔️ |  34,117 |           30,197 |            9,314 |            5,645 |
  | `graphemer`                  |    ✖️ ️| 410,424 |           95,104 |           15,752 |           10,660 |
  | `grapheme-splitter`          |    ✖️ | 122,241 |           23,680 |            7,852 |            4,841 |

</details>

`unicode-segmenter/grapheme` is 7~15x faster than alternatives (including the native [`Intl.Segmenter`]).

The gap becomes larger depending on the environment. On Intel(x64) Linux machines it measures 8~20x.

<details>
  <summary>Details</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v21.7.1 (arm64-darwin)
  
  benchmark              time (avg)             (min … max)       p75       p99      p999
  --------------------------------------------------------- -----------------------------
  • Lorem ipsum (ascii)
  --------------------------------------------------------- -----------------------------
  unicode-segmenter   5'040 ns/iter     (4'583 ns … 243 µs)  4'875 ns  6'083 ns 53'167 ns
  Intl.Segmenter     45'382 ns/iter    (43'125 ns … 498 µs) 44'291 ns 51'541 ns    306 µs
  graphemer          46'386 ns/iter    (45'000 ns … 203 µs) 45'667 ns 82'958 ns    131 µs
  grapheme-splitter  74'067 ns/iter    (72'583 ns … 301 µs) 73'167 ns 86'875 ns    215 µs
  
  summary for Lorem ipsum (ascii)
    unicode-segmenter
     9x faster than Intl.Segmenter
     9.2x faster than graphemer
     14.7x faster than grapheme-splitter
  
  • Emojis
  --------------------------------------------------------- -----------------------------
  unicode-segmenter   1'748 ns/iter     (1'542 ns … 224 µs)  1'708 ns  2'167 ns  7'500 ns
  Intl.Segmenter     13'780 ns/iter  (11'166 ns … 3'558 µs) 12'667 ns 17'000 ns 65'041 ns
  graphemer          12'974 ns/iter    (12'209 ns … 358 µs) 12'875 ns 14'625 ns    120 µs
  grapheme-splitter  27'124 ns/iter    (26'458 ns … 314 µs) 27'375 ns 29'458 ns 46'416 ns
  
  summary for Emojis
    unicode-segmenter
     7.42x faster than graphemer
     7.88x faster than Intl.Segmenter
     15.52x faster than grapheme-splitter
  
  • Demonic characters
  --------------------------------------------------------- -----------------------------
  unicode-segmenter   1'684 ns/iter   (1'602 ns … 1'832 ns)  1'719 ns  1'831 ns  1'832 ns
  Intl.Segmenter      4'850 ns/iter   (3'253 ns … 8'999 ns)  7'691 ns  8'766 ns  8'999 ns
  graphemer          25'454 ns/iter    (24'416 ns … 643 µs) 24'917 ns 28'833 ns    187 µs
  grapheme-splitter  18'473 ns/iter    (17'833 ns … 257 µs) 18'250 ns 19'875 ns    134 µs
  
  summary for Demonic characters
    unicode-segmenter
     2.88x faster than Intl.Segmenter
     10.97x faster than grapheme-splitter
     15.12x faster than graphemer
  
  • Tweet text (combined)
  --------------------------------------------------------- -----------------------------
  unicode-segmenter   7'850 ns/iter   (7'753 ns … 8'122 ns)  7'877 ns  8'079 ns  8'122 ns
  Intl.Segmenter     60'581 ns/iter    (57'916 ns … 405 µs) 59'167 ns 66'458 ns    358 µs
  graphemer          66'303 ns/iter    (64'708 ns … 287 µs) 65'500 ns 73'459 ns    206 µs
  grapheme-splitter     146 µs/iter       (143 µs … 466 µs)    145 µs    157 µs    397 µs
  
  summary for Tweet text (combined)
    unicode-segmenter
     7.72x faster than Intl.Segmenter
     8.45x faster than graphemer
     18.6x faster than grapheme-splitter
  
  • Code snippet (combined)
  --------------------------------------------------------- -----------------------------
  unicode-segmenter  18'738 ns/iter    (18'000 ns … 239 µs) 18'375 ns 21'750 ns    124 µs
  Intl.Segmenter        140 µs/iter       (134 µs … 368 µs)    137 µs    264 µs    300 µs
  graphemer             161 µs/iter       (154 µs … 436 µs)    162 µs    260 µs    362 µs
  grapheme-splitter     343 µs/iter       (337 µs … 622 µs)    341 µs    420 µs    622 µs
  
  summary for Code snippet (combined)
    unicode-segmenter
     7.45x faster than Intl.Segmenter
     8.59x faster than graphemer
     18.28x faster than grapheme-splitter
  ```

</details>

## LICENSE

[MIT](LICENSE)

See also [license](licenses/unicode-segmentation_MIT.txt) of the original code.

[unicode-segmentation]: https://github.com/unicode-rs/unicode-segmentation
[`Intl.Segmenter`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
[graphemer]: https://github.com/flmnt/graphemer
[grapheme-splitter]: https://github.com/orling/grapheme-splitter
[emoji-regex]: https://github.com/mathiasbynens/emoji-regex
