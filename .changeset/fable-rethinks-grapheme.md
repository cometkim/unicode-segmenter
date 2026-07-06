---
"unicode-segmenter": minor
---

Rewrite the grapheme segmenter with flat lookup tables and pair-rule dispatch.

- Bundle: −31% minified, −34% min+gzip, −26% min+brotli, −10% Hermes bytecode
- Runtime: fastest in the ecosystem on every benchmark case, ~1.1x faster on Hermes
- Memory: −44% retained heap, no retained per-range JS objects

Also fixes several segmentation bugs where results diverged from `Intl.Segmenter`:

- GB11: ZWJ joined non-pictographic characters (e.g. `'👍‍a'`), double ZWJ, and SpacingMark-interrupted `Extend*` sequences; ExtPic after a Prepend never armed the rule
- GB9c: `InCB=None` characters (matras, ZWNJ) did not reset the conjunct sequence; consonants after a Prepend never started one
- Unassigned `U+D7FC..U+D7FF` were treated as Hangul `T`

The public API is unchanged. The internal `_incb_data` module is removed
(its data is folded into the grapheme table).
