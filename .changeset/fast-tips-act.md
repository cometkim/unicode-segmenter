---
"unicode-segmenter": minor
---

- grapheme: Use `String.prototype.codePointAt`
- grapheme: Optimize character length checking, also reduce the size a bit
- utils: Add `isBMP` and `isSMP` util to check a codepoint number is being BMP(Basic Multilingual Plane) range
- utils: Deprecated `takeCodePoint` and `takeChar` in favor of ES6 `String.prototype.codePointAt` and `String.fromCodePoint`
- utils: `takeChar` is no longer depends on `String.fromCodePoint` internally
