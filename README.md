# unicode-segmenter
[![Package Version](https://img.shields.io/npm/v/unicode-segmenter)](https://npm.im/unicode-segmenter)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/unicode-segmenter)](https://bundlephobia.com/package/unicode-segmenter)
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

- Use grapheme segmenter:
  ```js
  import { graphemeSegments } from 'unicode-segmenter/grapheme';
  ```

- Use [`Intl.Segmenter`] adapter (only `granularity: "grapheme"` available):
  ```js
  import { Segmenter } from 'unicode-segmenter/intl-adapter';

  // Same API with `Intl.Segmenter`!
  const segmenter = new Segmenter();
  ```

- Use [`Intl.Segmenter`] polyfill (only `granularity: "grapheme"` available):
  ```js
  // Apply polyfill!
  import 'unicode-segmenter/intl-polyfill';

  const segmenter = new Intl.Segmenter();
  ```

### TypeScript

No worry. Library is fully typed, and provides `.d.ts` file 😉.

## Benchmark

This library aims to be lighter and faster than other existing libraries in the ecosystem.

`unicode-segmenter/grapheme`@latest vs with:

- [`Intl.Segmenter`] in Node.js (browser's version may vary)
- [graphemer]@1.4.0 (16.6M+ weekly downloads)
- [grapheme-splitter]@1.0.4 (5.7M+ weekly downloads)

Tested on:
- Apple MacBook Pro 18 (M1 Pro) macOS 14.1.1 arm64
- Node.js 21.7.1 (V8 11.8.172.17-node.20)

### Bundle Stats

| Name                         | ESM? | Size    | Size (min)       | Size (min+gzip)  | Size (min+br)    |
|------------------------------|------|--------:|-----------------:|-----------------:|-----------------:|
| `unicode-segmenter/grapheme` |    ✔️ |  54,351 |           40,399 |            9,586 |            5,359 |
| `graphemer`                  |    ✖️ ️| 410,424 |           95,104 |           15,752 |           10,660 |
| `grapheme-splitter`          |    ✖️ | 122,241 |           23,680 |            7,852 |            4,841 |

See [benchmark/bundle-stats.js](benchmark/bundle-stats.js) for more detail.

### Performance

| Task Name                    | ops/sec   | Average Time (ns)   |  Margin |  Samples |
|------------------------------|----------:|--------------------:|--------:|---------:|
| `unicode-segmenter/grapheme` | 1,035,579 |   965.7360103527205 | ± 0.25% |  517,740 |
| `Intl.Segmenter`             |   379,206 |  2673.1848024250185 | ±24.34% |  187,043 |
| `graphemer`                  |   385,927 |  2596.4455787960496 | ± 0.44% |  192,572 |
| `grapheme-splitter`          |   228,615 |  4450.0678901368470 | ± 0.63% |  112,358 |

See [benchmark/performance.js](benchmark/performance.js) for more detail.

## LICENSE

[MIT](LICENSE)

See also [license](licenses/unicode-segmentation_MIT.txt) of the original code.

[unicode-segmentation]: https://github.com/unicode-rs/unicode-segmentation
[`Intl.Segmenter`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
[graphemer]: https://github.com/flmnt/graphemer
[grapheme-splitter]: https://github.com/orling/grapheme-splitter
