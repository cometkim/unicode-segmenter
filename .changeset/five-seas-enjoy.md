---
"unicode-segmenter": patch
---

Optimizing grapheme break category lookup for better runtime trade-offs.

See [issue](https://github.com/cometkim/unicode-segmenter/issues/104) for the explanation.

With this change, the library's constant memory footprint is reduced from 64 KB to 14 KB without performance regressions.
However, the code size increases slightly due to inlining. It's still relatively small.
