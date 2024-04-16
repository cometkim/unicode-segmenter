---
"unicode-segmenter": minor
---

Getting 2x faster by optimizing hot path. Also with reduced bundle size

By casting Unicode chars to u32 in advance, all internal operations become 32-bit integer operations.

The previous version (v0.1.6) was
- 2.47x faster than Intl.Segmenter
- 2.68x faster than graphemer
- 4.95x faster than grapheme-splitter

Now it is
- 5.04x faster than Intl.Segmenter
- 5.52x faster than graphemer
- 9.83x faster than grapheme-splitter
