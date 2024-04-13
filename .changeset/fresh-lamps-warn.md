---
"unicode-segmenter": patch
---

Override package's defualt type to `"commonjs"` in publishConfig

Since it is still necessary for TypeScript projects.
(See https://github.com/microsoft/TypeScript/issues/54523)

It doesn't actually affects module resolution as we have explicit entries for each modules.
Just workaround.
