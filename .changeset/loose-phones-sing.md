---
"unicode-segmenter": patch
---

Fix TypeScript Node16 module resolution for CommonJS modules.

More specifically, the "[Masquerading as CJS](https://github.com/arethetypeswrong/arethetypeswrong.github.io/blob/main/docs/problems/FalseCJS.md)" issue has been fixed.

unicode-segmenter continues to support CommonJS (at least up to v1), so this change slightly increases the size of node_modules because it requires duplicate content.

Also, pre-bundled files (`unicode-segmenter/bundle/*`) are included for browsers and miniprograms. They were missing in previous versions due to a path typo in the build script.
