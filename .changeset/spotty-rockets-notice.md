---
"unicode-segmenter": minor
---

Reduced bundle size, while keeping the best perf

Some details:

- Refactored to use the same code path internally as possible.
- Removed pre-computed jump table, the optimization were compensated for by other perf improvements.
- Previous array layout to avoid accidental de-opt turned out to be overkill. The regular tuple array is well optimized, so I fall back to using good old plain binary search.
- Some experiments like new encoding and eytzinger layout for more aggressive improvements, but no success.
