---
"unicode-segmenter": minor
---

Add `collectGraphemeIndices(input, dest)` API that collects the start indices of the grapheme clusters found in the input string into the given destination array.

This is a faster and more GC friendly version of `collectGraphemes(input)` since the input string is not split into every grapheme cluster.
