---
"unicode-segmenter": patch
---

Fix `{Extend}`+`{Extended_Pictographic}` sequence

Counterexample:
- '👩‍🦰👩‍👩‍👦‍👦🏳️‍🌈' -> 3 graphemes

Reported from https://github.com/eslint/eslint/pull/18359
