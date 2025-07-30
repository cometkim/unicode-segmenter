---
"unicode-segmenter": patch
---

Optimize grapheme segmenter.

By eliminating unnecessary string concatenation, it significantly improved performance when creating large segments. (e.g. Demonic, Hindi, Flags, Skin tones)
Also reduced the memory footprint by internal segment buffer.
