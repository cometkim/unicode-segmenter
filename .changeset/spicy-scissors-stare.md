---
"unicode-segmenter": minor
---

Deprecated `isEmoji(cp)` in favor of `isExtendedPictogrphic(cp)`.

There are no differences, but it was confused with the `\p{Emoji}` Unicode property.

(Note: `\p{Emoji}` is not useful in actual use cases, [see](https://stackoverflow.com/questions/70401560/what-is-the-difference-between-emoji-presentation-and-extended-pictographic))
