---
name: bench-records
description: Archive benchmark runs into benchmark/grapheme/_records and regenerate the HTML report. Use when adding or refreshing a perf record for Node.js, Bun, Chrome, Firefox, or Safari, or when asked to update the benchmark report.
---

# Benchmark records

`benchmark/grapheme/_records/` archives verbatim mitata outputs; `report.mjs` parses them into `report.generated.html` (committed alongside the records).

## File naming

`YYYYMMDD-{cpu}-{os}-{runtime}_{version}.txt`, all lowercase snake_case, e.g.
`20260707-apple_m4_pro-macos_26.5-nodejs_26.4.0.txt`.
One file per (date, platform, runtime); a same-day re-run replaces the file.

## Capturing

A record must be the verbatim, complete mitata output: the `clk:`/`cpu:`/`runtime:` header, every benchmark group, and every `summary` block. Never trim, reformat, or reconstruct — the report parser and humans both read it raw, and the case names contain invisible Unicode that is easy to corrupt.

- **Node**: `yarn perf:grapheme`, capture stdout (non-TTY output is already plain text).
- **Bun**: `bun --bun run perf:grapheme` (`--bun` is required, otherwise Bun shells out to Node).
- **Chrome (automatable)**: start `yarn perf:grapheme:browser` in the background (vite dev server). With the chrome-devtools MCP: navigate to the served URL, click the "Execute benchmark" button, wait until the button is re-enabled (the worker posts `done`), then read the `#output` element's `innerText` via `evaluate_script`. The MCP can only write files inside the workspace — save to a repo-relative temp path first, then move into `_records/`.
- **Safari / Firefox (manual)**: the user runs the same vite page themselves and pastes the output. Write the pasted text to the record file exactly as given; when editing an existing record, watch for accidentally duplicating a summary block (it happened once).

## After writing a record

1. Sanity-parse it: expect 6 benchmark groups, and every competitor present in each summary block.
2. Regenerate the report: `node benchmark/grapheme/_records/report.mjs` — prints record/platform counts and rewrites `report.generated.html`.
3. Tell the user the per-competitor speedup ranges from the new record (e.g. "Intl.Segmenter 1.9–2.5x").
4. The user commits records themselves — never run `git commit`.

## Measurement-quality flags

- **Safari coarse-timer clamping**: `0.00 ps` minimums or `1.00 ms` maximums mean the reduced-precision timer quantized the samples; affected rows (often the short ASCII case) can read ~2x off. Archive as provided, but flag it — a re-run with the tab focused usually fixes it.
- Browser runs are sensitive to background-tab throttling; ask for a focused, foreground run when numbers look inconsistent with the platform's other rows.
- README performance claims are qualitative ranges; a single noisy record rarely requires editing README.md.
