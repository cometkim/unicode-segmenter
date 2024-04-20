---
"unicode-segmenter": patch
---

- Fix `Intl.Segmenter` adapter type definitions to be 100% compatible with tslib
- Implemented `Intl.Segmenter.prototype.resolvedOptions`.\
   But since the locale matcher is environment-specific,
   the adapter returns input locale as-is, or fallback to `en`.
