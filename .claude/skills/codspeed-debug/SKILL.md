---
name: codspeed-debug
description: Investigate CodSpeed CI performance reports on PRs — regressions or improbable improvements that don't reproduce locally. Use when the CodSpeed check flags a delta and you need to replicate or explain it.
---

# Debugging CodSpeed results

CI (`.github/workflows/codspeed.yml`) runs `node benchmark/grapheme/codspeed.js` (tinybench + `@codspeed/tinybench-plugin`) under `CodSpeedHQ/action` in **simulation mode**: a valgrind-style instrumented VM counting simulated CPU work, not wall clock. Its numbers routinely disagree with mitata.

## How the instrumented measurement differs from mitata

- V8 runs with stability flags (e.g. `--predictable --hash-seed=1`) and the plugin measures roughly: a few warmup calls → forced `gc()` → **one** measured call.
- Consequence 1: the measured call sees whatever tier the code reached during warmup. The repo defends with a 2000-iteration `beforeAll` warmup in `codspeed.js` — do not remove it.
- Consequence 2 (the big trap): **forced GC clears weak references embedded in optimized code** (deopt reason: `embedded weak objects cleared` — e.g. hidden-class maps of objects with no live instances), so optimized code deopts right before the measured call, producing phantom regressions up to ~60%.
  - Defense in `src/grapheme.js`: the pin block stashing a live generator and its first result on `PAIR._keep`, which keeps the segment-object hidden classes strongly reachable across GC. Do not remove it.
  - A module-scope `const _keep = ...` does NOT work — unreferenced module bindings don't survive module evaluation; the pin must hang off an object that stays reachable (`PAIR`).

## Local replication recipe

Write a scratch script that mimics the protocol per case: N warmup calls, `globalThis.gc()`, then time exactly one call. Run with:

```
node --expose-gc --predictable --hash-seed=1 scratch.mjs
```

Diagnose tiering with `--trace-deopt`, `--trace-opt`, and `--trace-baseline`; a deopt logged between the `gc()` and the measured call is the smoking gun.

## Other V8 behaviors that have bitten this repo

- Sparkplug (baseline) compiles in batches with a ~4 KiB source-length threshold: one huge function can be compiled alone or later than the same logic split into smaller functions, so pure source-size changes can shift tier-up timing and show up as CodSpeed deltas unrelated to algorithmic cost.
- Deltas under ~5% in simulation mode are noise. Before reacting to anything, open the flame diff on codspeed.io and check whether the changed frames are in the segmenter or in the harness/GC.
