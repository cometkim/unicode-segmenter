---
"unicode-segmenter": patch
---

Optimize the hot loop based on a deep analysis of the V8 optimization chain.

As the result, the bundle size, speed, and memory usage. All three axes are improved. See PR [#144](https://github.com/cometkim/unicode-segmenter/pull/144) for detailed explanation.

- Bundle: −4.2% min+gzip, −3.9% min+brotli on `unicode-segmenter/grapheme` (2,453 → 2,351 gzip); −3.4% / −2.8% on the full entry
- Hermes bytecode: −20.6% (20,015 → 15,892 bytes), −18.6% gzipped
- Runtime (Node.js/V8, per benchmark case)
  - `splitGraphemes()` 1.5–2.2x, `countGraphemes()` 1.20–1.43x, `graphemeSegments()` 1.05–1.21x, `collectGraphemes()` 1.01–1.19x. 
  - Bun/JSC gains are larger, and the interpreter tiers (Hermes, QuickJS) improve 5–23%
- Memory: lookup tables 20.6 kB → 19.1 kB, retained heap 228 kB → 218 kB, module init 1.7 ms → 1.5 ms

The state compaction strategy is the major part. It is valid across all optimization tiers of the V8 runtime (Jitless, Maglev, TurboFan) and has been consistently improved across all other engines.

Another noticeable change is `splitGraphemes()`, it now owns its loop, just like `countGraphemes()`.
It produces a 30-60% performance improvement. The size increase is roughly free after compression, since the fourth byte-aligned copy of the loop back-references the other three. And the uncompressed size is amortized by other improvements.

All the analysis have done by Claude Opus 5, well-done!
