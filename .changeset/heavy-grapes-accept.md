---
"unicode-segmenter": patch
---

Add `collectGraphemes(input)` API that collects grapheme clusters into an array directly.

This is a fast version of `[...splitGraphemes(input)]`, which is acually the most used pattern in practice.

It's 2-4x faster than the iterator-based approach. However, it collects all grapheme clusters at once, so it's not good for large text or streamed input.
