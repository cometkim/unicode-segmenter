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

unicode-segmenter@latest vs:

- Node.js' built-in [`Intl.Segmenter`] (browser's version may vary)
- [graphemer]@1.4.0 (16.6M+ weekly downloads on NPM)
- [grapheme-splitter]@1.0.4 (5.7M+ weekly downloads on NPM)

### Bundle Stats

| Name                         | ESM? | Size    | Size (min)       | Size (min+gzip)  | Size (min+br)    |
|------------------------------|------|--------:|-----------------:|-----------------:|-----------------:|
| `unicode-segmenter/grapheme` |    ✔️ |  43,742 |           29,566 |            9,001 |            5,657 |
| `graphemer`                  |    ✖️ ️| 410,424 |           95,104 |           15,752 |           10,660 |
| `grapheme-splitter`          |    ✖️ | 122,241 |           23,680 |            7,852 |            4,841 |

See [benchmark/bundle-stats.js](benchmark/bundle-stats.js) for more detail.

### Performance

```
cpu: Apple M1 Pro
runtime: node v21.7.1 (arm64-darwin)

benchmark              time (avg)             (min … max)       p75       p99      p999
--------------------------------------------------------- -----------------------------
unicode-segmenter     542 ns/iter       (516 ns … 791 ns)    550 ns    611 ns    791 ns
Intl.Segmenter      2'444 ns/iter   (1'570 ns … 3'455 ns)  2'679 ns  3'453 ns  3'455 ns
graphemer           2'616 ns/iter   (2'578 ns … 2'953 ns)  2'619 ns  2'860 ns  2'953 ns
grapheme-splitter   4'645 ns/iter     (4'208 ns … 346 µs)  4'334 ns  5'958 ns 56'542 ns

summary
  unicode-segmenter
   4.51x faster than Intl.Segmenter
   4.83x faster than graphemer
   8.58x faster than grapheme-splitter
```

See [benchmark/performance.js](benchmark/performance.js) for more detail.

## LICENSE

[MIT](LICENSE)

See also [license](licenses/unicode-segmentation_MIT.txt) of the original code.

[unicode-segmentation]: https://github.com/unicode-rs/unicode-segmentation
[`Intl.Segmenter`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
[graphemer]: https://github.com/flmnt/graphemer
[grapheme-splitter]: https://github.com/orling/grapheme-splitter
