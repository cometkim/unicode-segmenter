---
"unicode-segmenter": minor
---

- New entries for Unicode's general and emoji properties

  ```js
  import {
    isLetter,       // match w/ \p{L}
    isNumeric,      // match w/ \p{N}
    isAlphabetic,   // match w/ \p{Alphabetic}
    isAlphanumeric, // match w/ [\p{N}\p{Alphabetic}]
  } from 'unicode-segmenter/general';

  import {
    isEmoji,             // match w/ \p{Extended_Pictographic}
    isEmojiPresentation, // match w/ \p{Emoji_Presentation}
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
