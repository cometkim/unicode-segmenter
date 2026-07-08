---
name: unicode-data
description: Regenerate the generated Unicode data modules (src/_grapheme_data.js, _general_data.js, _emoji_data.js, test/_unicode_testdata.js) and verify correctness. Use when bumping the Unicode version, editing scripts/unicode.js or scripts/lib/encoding.js, or changing grapheme break rules or the pair table.
---

# Unicode data pipeline

`node scripts/unicode.js` downloads UCD files for the pinned `UNICODE_VERSION` (a const near the top of the script) into `scripts/unicode_data/` (cached — delete a file to re-fetch) and regenerates:

- `src/_grapheme_data.js` — `grapheme_data` (encoded ranges), `grapheme_cats` (one base36 digit per range), `grapheme_pairs` (256-digit 16×16 break-decision table), `GraphemeCategory` enum
- `src/_general_data.js`, `src/_emoji_data.js` — flat membership tables
- `test/_unicode_testdata.js` — official GraphemeBreakTest cases consumed by `yarn test`

Never hand-edit generated files; fix the generator and re-run.

## Encoding invariants (breaking any of these corrupts data silently)

- Ranges are delta + base36-VLQ encoded: 4 payload bits + 1 continuation bit per character, alphabet `[0-9a-v]`, decoded by native `parseInt(ch, 36)` in `src/core.js` (`decodeUnicodeData`). Encoder lives in `scripts/lib/encoding.js`. base36 was chosen over base64 deliberately: no codec needed in the bundle, and it compresses better under gzip/brotli.
- Ranges must be sorted and non-overlapping (delta gaps are non-negative by construction).
- Flat tables pack `end << 5 | category` into Uint32 (`findUnicodeRangeCategory` unpacks with `>>> 5` / `& 31`). Category max is 31; the largest real value is 23 (word break). A future category beyond 31 requires a format change in both `core.js` and the generator.
- Grapheme category 15 (`InCB_Consonant`) is internal-only — it exists so InCB=Consonant data folds into the main grapheme table instead of a separate module. It must never leak through the public API: `graphemeSegments` masks it to 0 in `_catBegin`/`_catEnd`.

## Pair table semantics

`grapheme_pairs[prevCat * 16 + curCat]` values: `0` = break, `1` = no break, `2` = GB12/13 (Regional Indicator parity), `3` = GB11 (ExtPic + ZWJ sequence), `4` = GB9c (InCB linker). The stateful cases (2–4) are resolved by the packed sequence state in `src/grapheme.js` (`nextState` + the gate mask). Rule changes belong in `buildGraphemePairTable()` in `scripts/unicode.js`, not in hand edits to the emitted string.

## Inlined fast paths

`src/grapheme.js` hardcodes hot regions (Latin, CJK, Hangul LV/LVT, PUA, variation selectors, E0000 tags, …) as computed checks plus three Uint8Array windows (T0: 0x0000–0x2FFF, T1: 0xA000–0xABFF, T2: 0x1F000–0x1FAFF); only the remainder reaches the binary-search tail. `scripts/unicode.js` asserts every inlined assumption against the raw UCD tables at codegen time, plus a tail-size cap (≤320 ranges). **If regeneration throws an assertion, a new Unicode version changed a region that grapheme.js inlines — update the inline logic in `src/grapheme.js` to match reality; never weaken the assertion.**

## Verification checklist after any regen or rule change

1. `yarn test` — includes the official UCD GraphemeBreakTest suite, fast-check property tests against `Intl.Segmenter` (100k runs each), and the real-world corpus suite (`test/corpora.js` over committed `test/_corpora/` fixtures — natural texts caught bugs both of the others missed; see issue #124).
2. For rule changes, deep-fuzz in the scratchpad: fast-check comparing `graphemeSegments` against `Intl.Segmenter` at ≥1M runs over full-Unicode strings. Divergences are not automatically bugs — the host ICU may lag or lead the pinned `UNICODE_VERSION`; adjudicate against the UAX #29 rules for the pinned version before "fixing" anything.
3. `yarn bundle-stats:grapheme` — data changes move bundle size; report the delta.
4. Add a changeset (`yarn changeset`) for anything user-visible; Unicode version bumps are user-visible.

On a Unicode version bump, also update `UNICODE_VERSION_STRING` in `scripts/corpora.js` (it pins the emoji-test.txt URL) and re-run `node scripts/corpora.js` to refresh the emoji corpus fixture. Downloads cache under `scripts/corpora_data/` (gitignored); the fixtures in `test/_corpora/` are committed.
