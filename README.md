# unicode-segmenter
[![NPM Package Version](https://img.shields.io/npm/v/unicode-segmenter)](https://npmjs.com/package/unicode-segmenter)
[![NPM Downloads](https://img.shields.io/npm/dw/unicode-segmenter)](https://npmjs.com/package/unicode-segmenter)
[![Integration](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml/badge.svg)](https://github.com/cometkim/unicode-segmenter/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/cometkim/unicode-segmenter/graph/badge.svg?token=3rA29JEH4J)](https://codecov.io/gh/cometkim/unicode-segmenter)
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

There are several entries for text segmentation.

- [`unicode-segmenter/grapheme`](#export-unicode-segmentergrapheme): Segments and counts **extended grapheme clusters**
- [`unicode-segmenter/intl-adapter`](#export-unicode-segmenterintl-adapter): [`Intl.Segmenter`] adapter
- [`unicode-segmenter/intl-polyfill`](#export-unicode-segmenterintl-polyfill): [`Intl.Segmenter`] polyfill

And extra utilities for combined use cases.

- [`unicode-segmenter/emoji`](#export-unicode-segmenteremoji): Matches single codepoint emojis
- [`unicode-segmenter/general`](#export-unicode-segmentergeneral): Matches single codepoint alphanumerics
- [`unicode-segmenter/utils`](#export-unicode-segmenterutils): Some utilities for handling codepoints 

### Export `unicode-segmenter/grapheme`
[![](https://edge.bundlejs.com/badge?q=unicode-segmenter/grapheme&treeshake=[*])](https://bundlejs.com/?q=unicode-segmenter%2Fgrapheme&treeshake=%5B*%5D)

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

Since [Hermes doesn't support the `Intl.Segmenter` API](https://github.com/facebook/hermes/blob/main/doc/IntlAPIs.md) yet, `unicode-segmenter` is a good alternative.

`unicode-segmenter` is compiled into small & efficient Hermes bytecode than other JavaScript libraries. See the [benchmark](#hermes-bytecode-stats) for details.

## Comparison

`unicode-segmenter` aims to be lighter and faster than alternatives in the ecosystem while fully spec compliant. So the benchmark is tracking several libraries' performance, bundle size, and Unicode version compliance.

### `unicode-segmenter/grapheme` vs

- [graphemer]@1.4.0 (16.6M+ weekly downloads on NPM)
- [grapheme-splitter]@1.0.4 (5.7M+ weekly downloads on NPM)
- [@formatjs/intl-segmenter]@11.5.7 (5.4K+ weekly downloads on NPM)
- WebAssembly build of [unicode-segmentation]@1.12.0 with minimum bindings
- Built-in [`Intl.Segmenter`] API

#### JS Bundle Stats

| Name                         | Unicode® | ESM? |   Size    | Size (min) | Size (min+gzip) | Size (min+br) |
|------------------------------|----------|------|----------:|-----------:|----------------:|--------------:|
| `unicode-segmenter/grapheme` |   16.0.0 |    ✔️ |    15,929 |     12,110 |           5,050 |         3,738 |
| `graphemer`                  |   15.0.0 |    ✖️ ️|   410,435 |     95,104 |          15,752 |        10,660 |
| `grapheme-splitter`          |   10.0.0 |    ✖️ |   122,252 |     23,680 |           7,852 |         4,841 |
| `@formatjs/intl-segmenter`*  |   15.0.0 |    ✖️ |   491,043 |    318,721 |          54,248 |        34,380 |
| `unicode-segmentation`*      |   16.0.0 |    ✔️ |    56,529 |     52,443 |          24,110 |        17,343 |
| `Intl.Segmenter`*            |        - |    - |         0 |          0 |               0 |             0 |

* `@formatjs/intl-segmenter` handles grapheme, word, and sentence, but it's not tree-shakable.
* `unicode-segmentation` size contains only minimum WASM binary and its bindings to execute benchmarking. It will increases to expose more features.
* `Intl.Segmenter`'s Unicode data depends on the host, and may not be up-to-date.
* `Intl.Segmenter` may not be available in [some old browsers](https://caniuse.com/mdn-javascript_builtins_intl_segmenter), edge runtimes, or embedded environments.

#### Hermes Bytecode Stats

| Name                         | Bytecode size | Bytecode size (gzip)* |
|------------------------------|--------------:|----------------------:|
| `unicode-segmenter/grapheme` |        22,019 |                11,513 |
| `graphemer`                  |       133,974 |                31,715 |
| `grapheme-splitter`          |        63,855 |                19,133 |

* It would be compressed when included as an app asset.

#### Runtime Performance

Here is a brief explanation, and you can see [archived benchmark results](benchmark/grapheme/_records).

**Performance in Node.js**: `unicode-segmenter/grapheme` is significantly faster than alternatives.
- 6\~15x faster than other JavaScript libraries
- 1.5\~3x faster than WASM binding of the Rust's [unicode-segmentation]
- 1.5\~3x faster than built-in [`Intl.Segmenter`]

**Performance in Bun**: `unicode-segmenter/grapheme` has almost the same performance as the built-in [`Intl.Segmenter`], with no performance degradation compared to other JavaScript libraries.

**Performance in Browsers**: The performance in browser environments varies greatly due to differences in browser engines and versions, which makes benchmarking less consistent. Despite these variations, `unicode-segmenter/grapheme` generally outperforms other JavaScript libraries in most environments.

**Performance in React Native**: `unicode-segmenter/grapheme` is significantly faster than alternatives when compiled to Hermes bytecode. It's 3\~8x faster than `graphemer` and 20\~26x faster than `grapheme-splitter`, with the performance gap increasing with input size.

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
[@formatjs/intl-segmenter]: https://formatjs.io/docs/polyfills/intl-segmenter/
