---
"unicode-segmenter": patch
---

Improved perf and bundle size a bit

It seems using `TypedArray` isn't helpful,
and deref many prototypes may cause deopt.

`Array` is good enough while it ensures it's packed.
