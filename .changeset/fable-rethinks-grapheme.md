---
"unicode-segmenter": minor
---

Rewrite the grapheme segmenter with flat lookup tables and pair-rule dispatch.

- Bundle: −24% minified, −29% min+gzip, −20% min+brotli
- Runtime: 1.2–1.5x faster on V8, 1.2–1.3x faster on Hermes
- Memory: −34% retained heap, no retained per-range JS objects

Also fixes several segmentation bugs where results diverged from `Intl.Segmenter`:

- GB11: ZWJ joined non-pictographic characters (e.g. `'👍‍a'`), double ZWJ, and SpacingMark-interrupted `Extend*` sequences; ExtPic after a Prepend never armed the rule
- GB9c: `InCB=None` characters (matras, ZWNJ) did not reset the conjunct sequence; consonants after a Prepend never started one
- Unassigned `U+D7FC..U+D7FF` were treated as Hangul `T`

The public API is unchanged, but note that `graphemeSegments()` now returns a plain
iterator object instead of a generator, and the internal `_incb_data` module is
removed (its data is folded into the grapheme table).
