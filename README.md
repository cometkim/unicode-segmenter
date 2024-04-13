# unicode-segmenter
[![Package Version](https://img.shields.io/npm/v/unicode-segmenter)](https://npm.im/unicode-segmenter)
[![LICENSE - MIT](https://img.shields.io/github/license/cometkim/unicode-segmenter)](#license)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/unicode-segmenter)](https://bundlephobia.com/package/unicode-segmenter)

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

vs with:
- [`Intl.Segmenter`] in Node.js (browser's version may vary)
- [graphemer]@1.4.0 (16.6M+ weekly downloads)
- [grapheme-splitter]@1.0.4 (5.7M+ weekly downloads)

Tested on:
- Apple MacBook Pro 18 (M1 Pro) macOS 14.1.1 arm64
- Node.js 21.7.1 (V8 11.8.172.17-node.20)

### Bundle Stats

| Name                         | ESM? | Size    | Size (min)       | Size (min+gzip)  | Size (min+br)    |
|------------------------------|------|--------:|-----------------:|-----------------:|-----------------:|
| `unicode-segmenter/grapheme` |    ✔️ |  44,824 |           30,782 |            9,755 |            5,922 |
| `graphemer`                  |    ✖️ ️| 410,410 |           95,091 |           15,749 |           10,674 |
| `grapheme-splitter`          |    ✖️ | 122,227 |           23,667 |            7,838 |            4,846 |

See [benchmark/bundle-stats.js](benchmark/bundle-stats.js) for more detail.

### Performance

| Task Name                    | ops/sec   | Average Time (ns) |  Margin |  Samples |
|------------------------------|----------:|------------------:|--------:|---------:|
| `unicode-segmenter/grapheme` | 1,005,097 |   994.92787966947 | ± 0.28% |  502,549 |
| `Intl.Segmenter`             |   379,206 |  2637.08266589833 | ±23.52% |  197,772 |
| `graphemer`                  |   385,927 |  2591.15740759950 | ± 0.47% |  192,964 |
| `grapheme-splitter`          |   228,615 |  4374.16200090944 | ± 0.21% |  114,308 |

See [benchmark/performance.js](benchmark/performance.js) for more detail.

## LICENSE

[MIT](LICENSE)

See also [license](licenses/unicode_segmentation-MIT.txt) of the original code.

[unicode-segmentation]: https://github.com/unicode-rs/unicode-segmentation
[`Intl.Segmenter`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
[graphemer]: https://github.com/flmnt/graphemer
[grapheme-splitter]: https://github.com/orling/grapheme-splitter
