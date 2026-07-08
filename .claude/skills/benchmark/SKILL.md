---
name: benchmark
description: Measure runtime perf, bundle size, and memory impact of unicode-segmenter changes. Use when evaluating any src/ change, running yarn perf / bundle-stats / memory-stats, comparing against a baseline revision, or when benchmark numbers look noisy or contradictory.
---

# Benchmarking unicode-segmenter

This library's priorities, in order: bundle size, runtime perf, memory footprint. Measure all three before claiming a change is a win — they regularly trade against each other.

## Commands

| Axis | Command | Notes |
|---|---|---|
| Runtime perf (Node) | `yarn perf:grapheme` (also `:general`, `:emoji`) | mitata; script passes `--expose-gc` |
| Runtime perf (Bun) | `bun --bun run perf:grapheme` | `--bun` forces the Bun runtime instead of Node |
| Runtime perf (browser) | `yarn perf:grapheme:browser` | vite page; capture procedure in the `bench-records` skill |
| Runtime perf (Hermes / QuickJS) | `yarn perf:grapheme:hermes`, `yarn perf:grapheme:quickjs` | Metro-based; see Metro warning |
| Bundle size | `yarn bundle-stats:grapheme` | esbuild; minified + gzip + brotli per library |
| Hermes bytecode | `yarn bundle-stats:grapheme:hermes` | React Native proxy metric |
| Memory | `yarn memory-stats:grapheme` | retained heap per library; forked child per lib, median of 5 samples × 10 uses |

Benchmarks import `src/*.js` directly — no build step needed, current checkout state is what gets measured.

## Interpreting results

- **Compare ratios within a run, not absolute ns across runs.** Apple Silicon clock scaling (3.7–4.5 GHz observed on M4 Pro) swings absolute numbers ±20% between runs. Each perf run includes the competitors, so the `summary` "x faster than" lines are the stable signal.
- Take best-of-3 when absolute numbers matter; close heavy apps first.
- Do not add mitata's `.gc('inner')` when comparing — it attributes per-iteration GC cost to the benchmark and distorts small cases.
- For bundle size, gzip/brotli are what users pay. Raw or minified chars can move opposite to compressed size (the base36-VLQ data encoding beats base64 after gzip despite more raw characters).
- Per-case reporting: the six shared cases (ASCII, emoji/ZWJ, Hindi/InCB, Zalgo, tweet, code) rarely move in one direction. Report each; flag any case regressing >10%.

## A/B against a baseline revision

Never move test inputs by copy-paste: they contain invisible codepoints (ZWJ, variation selectors) and were mangled exactly that way once. Always import `benchmark/grapheme/_testcases.js`.

1. Materialize the baseline's module closure with read-only git into the scratchpad:
   `git show origin/main:src/grapheme.js > <scratch>/baseline/grapheme.js` — repeat for `core.js`, `_grapheme_data.js`, and whatever else that revision imports.
2. Write one scratch mitata script importing BOTH implementations plus `_testcases.js`, registering old/new for each case in the same process.
3. Run at least twice with declaration order swapped to detect order bias.

## Size-sensitive coding notes (learned the hard way)

- esbuild inlines `const`-bound numeric literals into every use site but preserves `let` bindings. Shared numeric bounds in `src/grapheme.js` (`BMP_MAX`, `T1_MIN`, `T2_MIN`) are deliberately `let` — keep them that way.
- Generator syntax is the deliberate choice over a class-based iterator: a class was 13–34% faster on V8 but cost ~+1.6 KiB Hermes bytecode after Babel class lowering (Hermes can't parse class syntax natively). Don't convert to a class without re-measuring V8, JSC, Hermes, and all three size metrics.
- `codePointAt()` beat manual `charCodeAt` surrogate pairing on every measured engine (17–20% faster on Hermes) and is smaller. Don't "optimize" it back.

## Metro warning (Hermes scripts)

Metro spawns a worker farm per invocation. When calling Metro programmatically (custom measurement pipelines, loops), always pass `maxWorkers: 1` in the `Metro.loadConfig` overrides — a runaway farm once spawned enough node processes to freeze the machine. One-off runs of the repo's own scripts are fine.
