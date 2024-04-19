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

- Use Unicode general property matchers:
  ```js
  import {
    isLetter,       // match w/ \p{L}
    isNumeric,      // match w/ \p{N}
    isAlphabetic,   // match w/ \p{Alphabetic}
    isAlphanumeric, // match w/ [\p{N}\p{Alphabetic}]
  } from 'unicode-segmenter/general';
  ```

- Use Emoji matchers
  ```js
  import {
    isEmoji,             // match w/ \p{Extended_Pictographic}
    isEmojiPresentation, // match w/ \p{Emoji_Presentation}
  } from 'unicode-segmenter/emoji';
  ```

- Count graphemes:
  ```js
  import { countGrapheme } from 'unicode-segmenter/grapheme';

  countGrapheme(input);
  ```

- Make an advanced grapheme matcher:
  ```js
  import { graphemeSegments, GraphemeCategory } from 'unicode-segmenter/grapheme';

  function* matchEmoji(str) {
    for (const { index, segment, _cat } of graphemeSegments(input)) {
      if (_cat === GraphemeCategory.Extended_Pictographic) {
        yield { emoji: segment, index };
      }
    }
  }
  ```

- Use [`Intl.Segmenter`] adapter (only `granularity: "grapheme"` available):
  ```js
  import { Segmenter } from 'unicode-segmenter/intl-adapter';

  // Same API with the `Intl.Segmenter`
  const segmenter = new Segmenter();
  ```

- Use [`Intl.Segmenter`] polyfill (only `granularity: "grapheme"` available):
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

### Emojis

`unicode-segmenter/emoji` vs:

- built-in Unicode RegExp
- [emoji-regex]@10.3.0 (101M+ weekly downloads on NPM)

<details open>
  <summary>Bundle stats</summary>

  | Name                        | ESM? | Size    | Size (min)       | Size (min+gzip)  | Size (min+br)    |
  |-----------------------------|------|--------:|-----------------:|-----------------:|-----------------:|
  | `unicode-segmenter/emoji`   |    ✔️ |   3,058 |            2,611 |            1,041 |              751 |
  | `emoji-regex`               |    ✔️ |  12,946 |           12,859 |            2,180 |            1,746 |

</details>

<details open>
  <summary>Runtime performance</summary>

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

### Unicode alpha + numeric

`unicode-segmenter/general` vs:

- built-in unicode RegExp

<details open>
  <summary>Bundle stats</summary>

  | Name                        | ESM? | Size    | Size (min)       | Size (min+gzip)  | Size (min+br)    |
  |-----------------------------|------|--------:|-----------------:|-----------------:|-----------------:|
  | `unicode-segmenter/general` |    ✔️ |  21,505 |           20,972 |            5,792 |            3,564 |

</details>

<details open>
  <summary>Runtime performance</summary>

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

### Grapheme clusters

`unicode-segmenter/grapheme` vs:

- Node.js' [`Intl.Segmenter`] (browser's version may vary)
- [graphemer]@1.4.0 (16.6M+ weekly downloads on NPM)
- [grapheme-splitter]@1.0.4 (5.7M+ weekly downloads on NPM)

<details open>
  <summary>Bundle stats</summary>

  | Name                         | ESM? | Size    | Size (min)       | Size (min+gzip)  | Size (min+br)    |
  |------------------------------|------|--------:|-----------------:|-----------------:|-----------------:|
  | `unicode-segmenter/grapheme` |    ✔️ |  34,197 |           30,190 |            9,342 |            5,677 |
  | `graphemer`                  |    ✖️ ️| 410,424 |           95,104 |           15,752 |           10,660 |
  | `grapheme-splitter`          |    ✖️ | 122,241 |           23,680 |            7,852 |            4,841 |

</details>

<details open>
  <summary>Runtime performance</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v21.7.1 (arm64-darwin)
  
  benchmark              time (avg)             (min … max)       p75       p99      p999
  --------------------------------------------------------- -----------------------------
  unicode-segmenter     388 ns/iter       (377 ns … 923 ns)    396 ns    427 ns    923 ns
  Intl.Segmenter      2'401 ns/iter   (1'581 ns … 3'134 ns)  2'637 ns  3'127 ns  3'134 ns
  graphemer           2'604 ns/iter   (2'576 ns … 2'842 ns)  2'607 ns  2'781 ns  2'842 ns
  grapheme-splitter   4'657 ns/iter     (4'208 ns … 308 µs)  4'334 ns  5'667 ns 55'542 ns
  
  summary
    unicode-segmenter
     6.18x faster than Intl.Segmenter
     6.71x faster than graphemer
     11.99x faster than grapheme-splitter
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
