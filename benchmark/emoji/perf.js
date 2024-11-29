import * as assert from 'node:assert/strict';
import { group, summary, barplot, bench, run } from 'mitata';
import emojiRegex from 'emoji-regex';
import EMOJIBASE_REGEX from 'emojibase-regex';

import { isBMP } from '../../src/utils.js';
import { isExtendedPictographic } from '../../src/emoji.js';
import { graphemeSegments, GraphemeCategory } from '../../src/grapheme.js';

let input = '🚀 새로운 유니코드 분할기 라이브러리 \'unicode-segmenter\'를 소개합니다! 🔍 각종 언어의 문자를 정확하게 구분해주는 강력한 도구입니다. Check it out! 👉 [https://github.com/cometkim/unicode-segmenter] #Unicode #Programming 🌐';

// Note:
// Seems emoji-regex does not fully comply with the `Extended_Pictographic` property
// Even with the `Emoji_Presentation`...?
//
// let input = 'aaaaa😂💯♡⌨';
// // '♡' never be matched

group('checking if any emoji (Extended_Pictographic)', () => {
  function anyEmoji(input) {
    let cursor = 0;
    let len = input.length;
    while (cursor < len) {
      let cp = input.codePointAt(cursor);
      if (isExtendedPictographic(cp)) {
        return true;
      }
      cursor += isBMP(cp) ? 1 : 2;
    }
    return false;
  }

  function anyEmojiByGrapheme(input) {
    for (const { _catBegin } of graphemeSegments(input)) {
      if (_catBegin === GraphemeCategory.Extended_Pictographic) {
        return true;
      }
    }
    return false;
  }

  let REGEXP_U = /\p{Extended_Pictographic}/u;
  let EMOJI_REGEX = new RegExp(emojiRegex(), '');

  assert.equal(anyEmoji(input), true);
  assert.equal(anyEmojiByGrapheme(input), true);
  assert.equal(REGEXP_U.test(input), true);
  assert.equal(EMOJI_REGEX.test(input), true);
  assert.equal(EMOJIBASE_REGEX.test(input), true);

  summary(() => {
    barplot(() => {
      bench('unicode-segmenter/emoji', () => {
        void anyEmoji(input);
      }).baseline(true);

      bench('unicode-segmenter/grapheme', () => {
        void anyEmojiByGrapheme(input);
      });

      bench('RegExp w/ unicode', () => {
        void REGEXP_U.test(input);
      });

      bench('emoji-regex', () => {
        void EMOJI_REGEX.test(input);
      });

      bench('emojibase-regex', () => {
        void EMOJIBASE_REGEX.test(input);
      });
    });
  });
});

group('match all emoji (Extended_Pictographic)', () => {
  function* allEmojis(input) {
    let cursor = 0;
    let len = input.length;
    while (cursor < len) {
      let cp = input.codePointAt(cursor);
      let ch = String.fromCodePoint(cp);
      if (isExtendedPictographic(cp)) {
        yield ch;
      }
      cursor += ch.length;
    }
  }

  function* allEmojisByGrapheme(input) {
    for (const { segment, _catBegin } of graphemeSegments(input)) {
      if (_catBegin === GraphemeCategory.Extended_Pictographic) {
        yield segment;
      }
    }
  }

  let REGEXP_U = /\p{Extended_Pictographic}/ug;
  let EMOJI_REGEX = emojiRegex();
  let EMOJIBASE_REGEX_G = new RegExp(EMOJIBASE_REGEX, 'g');

  let expected = ['🚀', '🔍', '👉', '🌐'];
  assert.deepEqual([...allEmojis(input)], expected);
  assert.deepEqual([...allEmojisByGrapheme(input)], expected);
  assert.deepEqual([...input.matchAll(REGEXP_U)].map(match => match[0]), expected);
  assert.deepEqual([...input.matchAll(EMOJI_REGEX)].map(match => match[0]), expected);
  assert.deepEqual([...input.matchAll(EMOJIBASE_REGEX_G)].map(match => match[0]), expected);

  summary(() => {
    barplot(() => {
      bench('unicode-segmenter/emoji', () => {
        void [...allEmojis(input)];
      }).baseline(true);

      bench('unicode-segmenter/grapheme', () => {
        void [...allEmojisByGrapheme(input)];
      });

      bench('RegExp w/ unicode', () => {
        void [...input.matchAll(REGEXP_U)];
      });

      bench('emoji-regex', () => {
        void [...input.matchAll(EMOJI_REGEX)];
      });

      bench('emojibase-regex', () => {
        void [...input.matchAll(EMOJIBASE_REGEX_G)];
      });
    });
  });
});

await run();
