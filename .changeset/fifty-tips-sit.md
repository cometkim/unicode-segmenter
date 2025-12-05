---
"unicode-segmenter": patch
---

Removed inefficient optimization code from grapheme segmenter.

The single range cache is barely hit after the entire BMP cache is hit.
So removed it to reduce code size, and to reduce comparison count.

Worth occupying 64KB of linear memory for BMP. It should definitely be acceptable, as it still uses less heap memory size than executing graphemer's uncompressed code.
