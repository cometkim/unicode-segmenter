---
"unicode-segmenter": patch
---

Improve runtime perf on the Unicode text processing.

By using a precomputed lookup table for the grapheme categries of BMP characters, it improves perf by more than 10% for common cases, even ~30% for some extream cases.

The lookup table consumes an additional 64 KB of memory, which is acceptable for most JavaScript runtime environments.

This optimization is introduced by OpenCode w/ OpenAI's GPT-OSS-120B. It is the second successful attempt at meaningful optimization in this library.
(The first one was the Claude Code w/ Claude Opus 4.0)
