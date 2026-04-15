---
"unicode-segmenter": patch
---

Fix GB9c rule; reset internal "InCB=Consonant" state properly.

So giving the following input:

```
# Malayalam KA + Virama + SPACE + VA
"क्‌ क"
```

Will now produces three sperated segments correctly.

Thanks to @spaceemotion for reporting this issue.
