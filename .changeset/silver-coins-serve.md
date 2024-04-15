---
"unicode-segmenter": patch
---

Reduce the production bundle size

Previously I did unescape `"\u{1F680}"` to `"🚀"` in the Unicode table. Since extra characters are required to escape, it reduces the output size.

However, escape sequences compress better. So leaving the build output as is makes more sense for production.
