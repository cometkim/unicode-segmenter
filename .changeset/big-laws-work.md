---
"unicode-segmenter": patch
---

Fix sourcemap reference error

- Include missing sourcemap files for transformed cjs entries
- Remove unnecessary transforms for esm entries and remove source map reference
