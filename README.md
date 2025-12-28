# unicode-segmenter
[![NPM Package Version](https://img.shields.io/npm/v/unicode-segmenter)](https://npmjs.com/package/unicode-segmenter)
[![NPM Downloads](https://img.shields.io/npm/dw/unicode-segmenter)](https://npmjs.com/package/unicode-segmenter)
[![Integration](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml/badge.svg)](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/cometkim/unicode-segmenter/graph/badge.svg?token=3rA29JEH4J)](https://codecov.io/gh/cometkim/unicode-segmenter)
[![CodSpeed Badge](https://img.shields.io/endpoint?url=https://codspeed.io/badge.json)](https://codspeed.io/cometkim/unicode-segmenter?utm_source=badge)
[![LICENSE - MIT](https://img.shields.io/github/license/cometkim/unicode-segmenter)](#license)

A lightweight implementation of the [Unicode Text Segmentation (UAX \#29)](https://www.unicode.org/reports/tr29)

- **Spec compliant**: Up-to-date Unicode data, verified by the official Unicode test suites and fuzzed with the native `Intl.Segmenter`, and maintaining 100% test coverage.

- **Excellent compatibility**: It works well on older browsers, edge runtimes, React Native (Hermes) and QuickJS.

- **Zero-dependencies**: It doesn't bloat `node_modules` or the network bandwidth. Like a small minimal snippet.

- **Small bundle size**: It effectively compresses the Unicode data and provides a bundler-friendly format.

- **Extremely efficient**: It's carefully optimized for runtime performance, making it the fastest one in the ecosystem—outperforming even the built-in `Intl.Segmenter`.

- **TypeScript**: It's fully type-checked, and provides type definitions and JSDoc.

- **ESM-first**: It primarily supports ES modules, and still supports CommonJS.

> [!NOTE]
> unicode-segmenter is now **[e18e] recommendation!**

## Unicode® Version

Unicode® 16.0.0

Unicode® Standard Annex \#29 - [Revision 45](https://www.unicode.org/reports/tr29/tr29-45.html) (2024-08-28)

## APIs

Entries for Unicode text segmentation.

- [`unicode-segmenter/grapheme`](#export-unicode-segmentergrapheme): Segments and counts **extended grapheme clusters**
- [`unicode-segmenter/intl-adapter`](#export-unicode-segmenterintl-adapter): [`Intl.Segmenter`] adapter
- [`unicode-segmenter/intl-polyfill`](#export-unicode-segmenterintl-polyfill): [`Intl.Segmenter`] polyfill

And matchers for extra use cases.

- [`unicode-segmenter/emoji`](#export-unicode-segmenteremoji): Matches single codepoint emojis
- [`unicode-segmenter/general`](#export-unicode-segmentergeneral): Matches single codepoint alphanumerics

### Export `unicode-segmenter/grapheme`

Utilities for text segmentation by extended grapheme cluster rules.

#### Example: Get grapheme segments

```js
import { graphemeSegments } from 'unicode-segmenter/grapheme';

[...graphemeSegments('a̐éö̲\r\n')];
// 0: { segment: 'a̐', index: 0, input: 'a̐éö̲\r\n' }
// 1: { segment: 'é', index: 2, input: 'a̐éö̲\r\n' }
// 2: { segment: 'ö̲', index: 4, input: 'a̐éö̲\r\n' }
// 3: { segment: '\r\n', index: 7, input: 'a̐éö̲\r\n' }
```

#### Example: Split graphemes

```js
import { splitGraphemes } from 'unicode-segmenter/grapheme';

[...splitGraphemes('#️⃣*️⃣0️⃣1️⃣2️⃣')];
// 0: #️⃣
// 1: *️⃣
// 2: 0️⃣
// 3: 1️⃣
// 4: 2️⃣
```

#### Example: Count graphemes

```js
import { countGraphemes } from 'unicode-segmenter/grapheme';

'👋 안녕!'.length;
// => 6
countGraphemes('👋 안녕!');
// => 5

'a̐éö̲'.length;
// => 7
countGraphemes('a̐éö̲');
// => 3
```

> [!NOTE]
> `countGraphemes()` is a small wrapper around `graphemeSegments()`.
> 
> If you need it more than once at a time, consider memoization or use `graphemeSegments()` or `splitSegments()` once instead.

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

Or build even more advanced one like an Unicode-aware [TTY string width](https://github.com/cometkim/unicode-string-width) utility.

### Export `unicode-segmenter/intl-adapter`

[`Intl.Segmenter`] API adapter (only `granularity: "grapheme"` available yet)

```js
import { Segmenter } from 'unicode-segmenter/intl-adapter';

// Same API with the `Intl.Segmenter`
const segmenter = new Segmenter();
```

### Export `unicode-segmenter/intl-polyfill`

[`Intl.Segmenter`] API polyfill (only `granularity: "grapheme"` available yet)

```js
// Apply polyfill to the `globalThis.Intl` object.
import 'unicode-segmenter/intl-polyfill';

const segmenter = new Intl.Segmenter();
```

### Export `unicode-segmenter/emoji`

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

## Runtime Compatibility

`unicode-segmenter` uses only fundamental features of ES2015, making it compatible with most browsers.

To ensure compatibility, the runtime should support:
- [`String.prototype.codePointAt()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/codePointAt)
- [Generators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)
- [Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)

If the runtime doesn't support these features, it can easily be fulfilled with tools like Babel.

## React Native Support

Since [Hermes doesn't support the `Intl.Segmenter` API](https://github.com/facebook/hermes/blob/main/doc/IntlAPIs.md) yet, `unicode-segmenter` is a good alternative.

`unicode-segmenter` is compiled into small & efficient Hermes bytecode than other JavaScript libraries. See the [benchmark](#hermes-bytecode-stats) for details.

## Comparison

`unicode-segmenter` aims to be lighter and faster than alternatives in the ecosystem while fully spec compliant. So the benchmark is tracking several libraries' performance, bundle size, and Unicode version compliance.

### `unicode-segmenter/grapheme` vs

- [graphemer]@1.4.0 (34.4M+ weekly downloads on NPM)
- [grapheme-splitter]@1.0.4 (6.3M+ weekly downloads on NPM)
- [@formatjs/intl-segmenter]@11.7.12 (10K+ weekly downloads on NPM)
- WebAssembly build of [unicode-segmentation]@1.12.0 with minimum bindings
- Built-in [`Intl.Segmenter`] API

#### JS Bundle Stats

| Name                         | Unicode® | ESM? |   Size    | Size (min) | Size (min+gzip) | Size (min+br) | Size (min+zstd) |
|------------------------------|----------|------|----------:|-----------:|----------------:|--------------:|----------------:|
| `unicode-segmenter/grapheme` |   16.0.0 |   ✔️ |    10,708 |      6,659 |           3,363 |         2,739 |           3,490 |
| `graphemer`                  |   15.0.0 |   ✖️ ️|   410,435 |     95,104 |          15,752 |        10,660 |          15,911 |
| `grapheme-splitter`          |   10.0.0 |   ✖️ |   122,254 |     23,682 |           7,852 |         4,802 |           6,753 |
| `@formatjs/intl-segmenter`*  |   15.0.0 |   ✖️ |   603,510 |    369,673 |          72,273 |        49,530 |          68,027 |
| `unicode-segmentation`*      |   15.1.0 |    - |    56,529 |     52,439 |          24,108 |        17,343 |          24,375 |
| `Intl.Segmenter`*            |        - |    - |         0 |          0 |               0 |             0 |               0 |

* `@formatjs/intl-segmenter` handles grapheme, word, and sentence, but it's not tree-shakable.
* `unicode-segmentation` size contains only minimum WASM binary and its bindings to execute benchmarking. It will increases to expose more features.
* `Intl.Segmenter`'s Unicode data depends on the host, and may not be up-to-date.
* `Intl.Segmenter` may not be available in [some old browsers](https://caniuse.com/mdn-javascript_builtins_intl_segmenter), edge runtimes, or embedded environments.

#### Hermes Bytecode Stats

| Name                         | Bytecode size | Bytecode size (gzip)* |
|------------------------------|--------------:|----------------------:|
| `unicode-segmenter/grapheme` |        20,259 |                11,417 |
| `graphemer`                  |       134,089 |                31,766 |
| `grapheme-splitter`          |        63,946 |                19,162 |

* It would be compressed when included as an app asset.

#### Runtime Performance

Here is a brief explanation, and you can see [archived benchmark results](benchmark/grapheme/_records).

**Performance in Node.js/Bun/Deno**: `unicode-segmenter/grapheme` has best-in-class performance.
- 8\~35x faster than other JavaScript libraries.
- 3\~5x faster than WASM binding of the Rust's [unicode-segmentation].
- 2\~3x faster than built-in [`Intl.Segmenter`].

**Performance in Browsers**: The performance in browser environments varies greatly due to differences in browser engines, which makes benchmarking inconsistent, but:
- Still significantly faster than other JavaScript libraries.
- Generally outperforms the built-in in the most browser environments, except the Firefox.

**Performance in React Native**: `unicode-segmenter/grapheme` is still faster than alternatives when compiled to Hermes bytecode. It's 3\~8x faster than `graphemer` and 20\~26x faster than `grapheme-splitter`, with the performance gap increasing with input size.

**Performance in QuickJS**: `unicode-segmenter/grapheme` is the only usable library in terms of performance.

Instead of trusting these claims, you can try `yarn perf:grapheme` directly in your environment or build your own benchmark.

## Acknowledgments

- **The Rust Unicode team ([@unicode-rs](https://github.com/unicode-rs))**:\
   The initial implementation was ported manually from [unicode-segmentation] library.

- **Marijn Haverbeke ([@marijnh](https://github.com/marijnh))**:\
   Inspired a technique that can greatly compress Unicode data table from [his library](https://github.com/marijnh/find-cluster-break).

## LICENSE

[MIT](LICENSE)

[e18e]: https://e18e.dev/
[Hermes]: https://hermesengine.dev/
[QuickJS]: https://bellard.org/quickjs/
[unicode-segmentation]: https://github.com/unicode-rs/unicode-segmentation
[`Intl.Segmenter`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
[graphemer]: https://github.com/flmnt/graphemer
[grapheme-splitter]: https://github.com/orling/grapheme-splitter
[emoji-regex]: https://github.com/mathiasbynens/emoji-regex
[emojibase-regex]: https://emojibase.dev/docs/regex
[XRegExp]: https://xregexp.com/
[@formatjs/intl-segmenter]: https://formatjs.github.io/docs/polyfills/intl-segmenter/
