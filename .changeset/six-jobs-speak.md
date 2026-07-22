---
"unicode-segmenter": patch
---

Promote `countGraphemes()` API to be a fast path.

It avoids generator overhead and only counts boundaries without allocating segments.
When only counting, it achieves ~10x faster runtime performance and no GC pressure.
