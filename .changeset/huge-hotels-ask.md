---
"unicode-segmenter": patch
---

Removed pinned `graphemeSegments()` in the module scope to make all APIs able to be three-shaken properly.

It was introduced when they all use `graphemeSegments()` as the core. But now they are all have their own loop.
