# unicode-segmenter
[![Package Version](https://img.shields.io/npm/v/unicode-segmenter)](https://npm.im/unicode-segmenter)
[![Integration](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml/badge.svg)](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/cometkim/unicode-segmenter/graph/badge.svg?token=3rA29JEH4J)](https://codecov.io/gh/cometkim/unicode-segmenter)
[![LICENSE - MIT](https://img.shields.io/github/license/cometkim/unicode-segmenter)](#license)

A lightweight and fast, pure JavaScript library for Unicode segmentation.

Including to deal with **UTF-8** characters, **Extended Grapheme Clusters**, **Emojis**, **Unicode letters**, **Unicode numbers** and more!

## Unicode® version

15.1.0 (2023 September 12)

- https://www.unicode.org/versions/Unicode15.1.0/
- https://www.unicode.org/Public/15.1.0/

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

#### Bundle stats

| Name                        | ESM? | Size    | Size (min)       | Size (min+gzip)  | Size (min+br)    |
|-----------------------------|------|--------:|-----------------:|-----------------:|-----------------:|
| `unicode-segmenter/emoji`   |    ✔️ |   3,058 |            2,611 |            1,041 |              751 |
| `emoji-regex`               |    ✔️ |  12,946 |           12,859 |            2,180 |            1,746 |

#### Runtime performance

The runtime performance of `unicode-segmenter/emoji` is enough to test the presence of emoji in a text.

It's ~2.5x worse than RegExp w/ `u` for match-all performance, but that's useless examples in the real world because others don't care about grapheme clusters.

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

#### Bundle stats

| Name                        | ESM? | Size    | Size (min)       | Size (min+gzip)  | Size (min+br)    |
|-----------------------------|------|--------:|-----------------:|-----------------:|-----------------:|
| `unicode-segmenter/general` |    ✔️ |  21,505 |           20,972 |            5,792 |            3,564 |

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

#### Bundle stats

| Name                         | ESM? | Size    | Size (min)       | Size (min+gzip)  | Size (min+br)    |
|------------------------------|------|--------:|-----------------:|-----------------:|-----------------:|
| `unicode-segmenter/grapheme` |    ✔️ |  33,822 |           30,060 |            9,267 |            5,631 |
| `graphemer`                  |    ✖️ ️| 410,424 |           95,104 |           15,752 |           10,660 |
| `grapheme-splitter`          |    ✖️ | 122,241 |           23,680 |            7,852 |            4,841 |

#### Runtime performance

`unicode-segmenter/grapheme` is 7~15x faster than JS alternatives (including the native [`Intl.Segmenter`], and 1.5~3x faster than WASM build of the Rust library.

The gap becomes larger depending on the environment. On Intel(x64) Linux machines it measures 8~20x.

<details>
  <summary>Details</summary>

  ```
  cpu: Apple M1 Pro
  runtime: node v20.13.1 (arm64-darwin)
  
  benchmark                                     time (avg)             (min … max)       p75       p99      p999
  -------------------------------------------------------------------------------- -----------------------------
  • Lorem ipsum (ascii)
  -------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                          5'116 ns/iter     (4'583 ns … 345 µs)  4'958 ns  6'625 ns 60'625 ns
  Intl.Segmenter                            50'934 ns/iter    (47'167 ns … 602 µs) 50'583 ns 57'542 ns    311 µs
  graphemer                                 48'157 ns/iter    (46'625 ns … 250 µs) 47'333 ns 77'417 ns    138 µs
  grapheme-splitter                         74'590 ns/iter    (73'291 ns … 307 µs) 73'834 ns 82'917 ns    181 µs
  unicode-rs/unicode-segmenter (wasm-pack)  16'150 ns/iter    (15'625 ns … 237 µs) 15'958 ns 17'958 ns 84'333 ns
  
  summary for Lorem ipsum (ascii)
    unicode-segmenter
     3.16x faster than unicode-rs/unicode-segmenter (wasm-pack)
     9.41x faster than graphemer
     9.96x faster than Intl.Segmenter
     14.58x faster than grapheme-splitter
  
  • Emojis
  -------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                          1'916 ns/iter   (1'861 ns … 2'043 ns)  1'938 ns  2'029 ns  2'043 ns
  Intl.Segmenter                            15'151 ns/iter  (12'333 ns … 2'895 µs) 14'167 ns 19'542 ns 99'583 ns
  graphemer                                 13'261 ns/iter    (12'667 ns … 305 µs) 13'000 ns 14'875 ns    129 µs
  grapheme-splitter                         27'394 ns/iter    (26'625 ns … 456 µs) 26'917 ns 32'541 ns 68'250 ns
  unicode-rs/unicode-segmenter (wasm-pack)   5'639 ns/iter   (5'481 ns … 7'052 ns)  5'706 ns  6'298 ns  7'052 ns
  
  summary for Emojis
    unicode-segmenter
     2.94x faster than unicode-rs/unicode-segmenter (wasm-pack)
     6.92x faster than graphemer
     7.91x faster than Intl.Segmenter
     14.29x faster than grapheme-splitter
  
  • Demonic characters
  -------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                          1'684 ns/iter   (1'604 ns … 1'790 ns)  1'719 ns  1'787 ns  1'790 ns
  Intl.Segmenter                             5'200 ns/iter   (3'639 ns … 9'750 ns)  8'077 ns  9'647 ns  9'750 ns
  graphemer                                 28'097 ns/iter    (26'333 ns … 259 µs) 27'917 ns 32'042 ns    176 µs
  grapheme-splitter                         20'999 ns/iter    (19'083 ns … 443 µs) 20'792 ns 26'375 ns    303 µs
  unicode-rs/unicode-segmenter (wasm-pack)   2'544 ns/iter   (2'433 ns … 2'771 ns)  2'579 ns  2'744 ns  2'771 ns
  
  summary for Demonic characters
    unicode-segmenter
     1.51x faster than unicode-rs/unicode-segmenter (wasm-pack)
     3.09x faster than Intl.Segmenter
     12.47x faster than grapheme-splitter
     16.69x faster than graphemer
  
  • Tweet text (combined)
  -------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                          8'391 ns/iter   (8'071 ns … 8'742 ns)  8'499 ns  8'716 ns  8'742 ns
  Intl.Segmenter                            69'354 ns/iter    (64'583 ns … 442 µs) 69'000 ns 76'500 ns    413 µs
  graphemer                                 70'686 ns/iter    (66'791 ns … 936 µs) 69'917 ns    102 µs    334 µs
  grapheme-splitter                            148 µs/iter     (142 µs … 1'145 µs)    146 µs    163 µs    465 µs
  unicode-rs/unicode-segmenter (wasm-pack)  24'242 ns/iter    (23'625 ns … 281 µs) 24'083 ns 25'625 ns    136 µs
  
  summary for Tweet text (combined)
    unicode-segmenter
     2.89x faster than unicode-rs/unicode-segmenter (wasm-pack)
     8.26x faster than Intl.Segmenter
     8.42x faster than graphemer
     17.67x faster than grapheme-splitter
  
  • Code snippet (combined)
  -------------------------------------------------------------------------------- -----------------------------
  unicode-segmenter                         18'526 ns/iter    (17'750 ns … 224 µs) 18'167 ns 21'875 ns    119 µs
  Intl.Segmenter                               159 µs/iter       (150 µs … 363 µs)    160 µs    292 µs    317 µs
  graphemer                                    165 µs/iter       (159 µs … 425 µs)    165 µs    266 µs    394 µs
  grapheme-splitter                            343 µs/iter       (333 µs … 603 µs)    342 µs    456 µs    602 µs
  unicode-rs/unicode-segmenter (wasm-pack)  57'403 ns/iter    (56'042 ns … 262 µs) 56'875 ns 61'125 ns    207 µs
  
  summary for Code snippet (combined)
    unicode-segmenter
     3.1x faster than unicode-rs/unicode-segmenter (wasm-pack)
     8.56x faster than Intl.Segmenter
     8.92x faster than graphemer
     18.52x faster than grapheme-splitter
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
