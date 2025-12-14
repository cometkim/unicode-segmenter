---
"unicode-segmenter": patch
---

Two further optimizations:

1. Remove inlined ranges from the data file.
2. Add inlined range: 0xAC00-0xD7A3 (Hangul syllables) can easily be inlined.

The 1 is something I forgot in #104 task, but it was a slight chance.

Btw, the number 2 is a huge finding. It is a pretty extensive range to be newly inlined.
Applying both optimizations significantly reduced the bundle size and memory footprint.

- Size(min): 12,549 bytes -> 6,846 bytes (-45.5%)
- Size(min+gz): 5,314 bytes -> 3,449 bytes (-35.1%)
- Index memory usage: 14,272 bytes -> 8,686 bytes (-39.2%)

Of course, without perf regression.
