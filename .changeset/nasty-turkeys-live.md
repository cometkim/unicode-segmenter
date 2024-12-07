---
"unicode-segmenter": patch
---

Fix bloat in the NPM package.

`package.tgz` was mostly bloated by CommonJS interop and sourcemap.

However, sourcemap isn't necessary here as it uses sources as is,
and the CommonJS shouldn't be different.

Now fixed by simpler transpilation for CommoJS entries, and removed sourcemap files.
Also removed inaccessible entries.

So the unpacked total package size has been **down to 135 KB from 250 KB**

Note: Node.js v22 will stabilize `require(ESM)`, which will allow CommonJS projects to use this package without having to maintain separate entries. I'm very excited about that, and looking forward to it becoming more "common". The first major release may consider ending support for CommonJS entries and TypeScript's `"Node"` resolution.
