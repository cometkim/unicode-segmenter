---
"unicode-segmenter": minor
---

Add `unicode-segmenter/grapheme-counter`, a standalone fast counter for extended grapheme clusters.

`countGraphemes()` from the new entry returns exactly the same result as the one in `unicode-segmenter/grapheme`, but runs the boundary rules directly without allocating segment objects or slicing strings:

- 4\~7x faster counting on V8, ~4x on Hermes, with zero allocation
- Standalone entry (4,856 bytes minified, 2,360 bytes gzipped); doesn't carry the segmenter code, and the segmenter entry doesn't carry the counter - even without tree-shaking
- The `countGraphemes()` wrapper in `unicode-segmenter/grapheme` is unchanged and stays as the convenience API
