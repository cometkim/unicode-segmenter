---
"unicode-segmenter": minor
---

Code size is signaficantly reduced, minified JS now works in half

There are also some performance improvements.
Not that much, but getting improvement on size without giving it up is a huge win.

- Compress Unicode data more in Base36

- Changed the internal representation into TypedArray to improve its access pattern.

- Shrank the grapheme lookup table size.
  This does not impact performance except for some edges like Hindi and Demonic, but it does reduce the bundle size.
