---
"unicode-segmenter": minor
---

- Rename `searchGrapheme` to `searchGraphemeCategory`, and deprecated old one.
- Rename `Segmenter` definitions from grapheme module to `GraphemeCategory`.
- Remove `SearchResult<T>`, and `GraphemeSearchResult` defnitions which are identical to `CategorizedUnicodeRange<T>`.
- Improve JSDoc comments to be more informative.
