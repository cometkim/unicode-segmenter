---
"unicode-segmenter": minor
---

semi-breaking: removed `_cat` from grapheme cluster segments because it was useless

Instead, added `_catBegin` and `_catEnd` as beginning/end category of segments, which are possibly useful to infer applied boundary rules.
