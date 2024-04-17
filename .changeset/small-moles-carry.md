---
"unicode-segmenter": minor
---

- New entries for Unicode's general and emoji properties

  ```js
  import {
    isLetter, // \p{L}
    isNumeric, // \p{N}
    isAlphabetic, // \p{Alpha}
    isAlphanumeric, // [\p{N}\p{Alpha}]
  } from "unicode-segmenter/general";

  import {
    isEmoji, // \p{Extended_Pictographic}
    isEmojiPresentation, // \p{Emoji_Presentation}
  } from "unicode-segmenter/emoji";
  ```

- Grapheme segementer now yields matched category to `_cat` field.
  It will be useful when building custom matchers by the category

  e.g. custom emoji matcher:

  ```js
  function* matchEmoji(str) {
    for (let { index, segment, input, _cat } of graphemeSegments(str)) {
      if (_cat === GraphemeCategory.Extended_Pictographic) {
        yield { emoji: segment, index };
      }
    }
  }
  ```
