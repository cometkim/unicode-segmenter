---
"unicode-segmenter": minor
---

Removed deprecated APIs

- `searchGrapheme` in `unicode-segmenter/grapheme`
- `takeChar` and `takeCodePoint` in `unicode-segmenter/utils`

Which are used internally before, but never from outside.
