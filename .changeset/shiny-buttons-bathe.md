---
"unicode-segmenter": patch
---

Move GB9c rule checking to be _after_ the main boundary checking.
To try to avoid unnecessary work as much as possible.

No noticeable changes, but perf seems to be improved by ~2% for most cases.
