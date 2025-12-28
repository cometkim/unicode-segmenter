---
"unicode-segmenter": patch
---

Inlined the grapheme boundary checking
to avoid unnecessary function calls in the hotpath and consolidating internal state.

This achieved the runtime perf by 2% and a slight bundle size reduction.
