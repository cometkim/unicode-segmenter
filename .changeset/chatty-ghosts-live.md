---
"unicode-segmenter": minor
---

Getting 2x faster by optimizing hot path. Also with reduced bundle size

By casting Unicode chars to u32 in advance, all internal operations become 32-bit integer operations.
