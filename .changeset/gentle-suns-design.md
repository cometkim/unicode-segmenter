---
"unicode-segmenter": minor
---

Expose an internal state: `_hd`;

The first codepoint of a segment, which is often need to be checked its bounds.

For example,

```ts
for (const { segment } of graphemeSegments(text)) {
  const cp = segment.codePointAt(0)!;
  // Also need to `!` assertions in TypeScript.
  if (isBMP(cp)) {
    // ...
  }
}
```

It can be replaced by `_hd` state. no additional overhead.
