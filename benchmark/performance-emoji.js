import * as assert from 'node:assert/strict';
import { group, baseline, bench, run } from 'mitata';
import emojiRegex from 'emoji-regex';
import EMOJIBASE_REGEX_EXT from 'emojibase-regex';
import EMOJIBASE_REGEX from 'emojibase-regex/emoji.js';

import { takeCodePoint } from '../src/utils.js';
import { isEmoji } from '../src/emoji.js';
import { graphemeSegments, GraphemeCategory } from '../src/grapheme.js';

let input = '🚀 새로운 유니코드 분할기 라이브러리 \'unicode-segmenter\'를 소개합니다! 🔍 각종 언어의 문자를 정확하게 구분해주는 강력한 도구입니다. Check it out! 👉 [https://github.com/cometkim/unicode-segmenter] #Unicode #Programming 🌐';

// Note:
// Seems emoji-regex does not fully comply with the `Extended_Pictographic` property
// Even with the `Emoji_Presentation`...?
//
// let input = 'aaaaa😂💯♡⌨';
// // '♡' never be matched

group('checking if any emoji', () => {
  function anyEmoji(input) {
    let cursor = 0;
    let len = input.length;
    while (cursor < len) {
      let cp = takeCodePoint(input, cursor, len);
      if (isEmoji(cp)) {
        return true;
      }
      let ch = String.fromCodePoint(cp);
      cursor += ch.length;
    }
    return false;
  }

  function anyEmojiByGrapheme(input) {
    for (const { segment, _cat } of graphemeSegments(input)) {
      if (_cat === GraphemeCategory.Extended_Pictographic) {
        return true;
      }
    }
    return false;
  }

  baseline('unicode-segmenter/emoji', () => {
    assert.equal(anyEmoji(input), true);
  });

  bench('unicode-segmenter/grapheme', () => {
    assert.equal(anyEmojiByGrapheme(input), true);
  });

  bench('RegExp w/ unicode', () => {
    assert.equal(/\p{Extended_Pictographic}/u.test(input), true);
  });

  // Should remove the `g` flag enabled by default.
  let EMOJI_REGEX = new RegExp(emojiRegex(), '');
  bench('emoji-regex', () => {
    assert.equal(EMOJI_REGEX.test(input), true);
  });

  bench('emojibase-regex', () => {
    assert.equal(EMOJIBASE_REGEX_EXT.test(input), true);
  });

  bench('emojibase-regex/emoji', () => {
    assert.equal(EMOJIBASE_REGEX.test(input), true);
  });
});

group('match all emoji', () => {
  function* allEmojis(input) {
    let cursor = 0;
    let len = input.length;
    while (cursor < len) {
      let cp = takeCodePoint(input, cursor, len);
      let ch = String.fromCodePoint(cp);
      if (isEmoji(cp)) {
        yield ch;
      }
      cursor += ch.length;
    }
  }

  function* allEmojisByGrapheme(input) {
    for (const { segment, _cat } of graphemeSegments(input)) {
      if (_cat === GraphemeCategory.Extended_Pictographic) {
        yield segment;
      }
    }
  }

  let expected = ['🚀', '🔍', '👉', '🌐'];

  baseline('unicode-segmenter/emoji', () => {
    assert.deepEqual(
      [...allEmojis(input)]
        .map(match => match), // iter for fair competition
      expected,
    );
  });

  bench('unicode-segmenter/grapheme', () => {
    assert.deepEqual(
      [...allEmojisByGrapheme(input)]
        .map(match => match), // iter for fair competition
      expected,
    );
  });

  bench('RegExp w/ unicode', () => {
    assert.deepEqual(
      [...input.matchAll(/\p{Extended_Pictographic}/ug)]
        .map(match => match[0]),
      expected,
    );
  });

  let EMOJI_REGEX = emojiRegex();
  bench('emoji-regex', () => {
    assert.deepEqual(
      [...input.matchAll(EMOJI_REGEX)]
        .map(match => match[0]),
      expected,
    );
  });

  let EMOJIBASE_REGEX_EXT_G = new RegExp(EMOJIBASE_REGEX_EXT, 'g');
  bench('emojibase-regex', () => {
    assert.deepEqual(
      [...input.matchAll(EMOJIBASE_REGEX_EXT_G)]
        .map(match => match[0]),
      expected,
    );
  });

  // Note: It doesn't match Extended_Pictographic
  //
  // let EMOJIBASE_REGEX_G = new RegExp(EMOJIBASE_REGEX, 'g');
  // bench('emojibase-regex/emoji', () => {
  //   assert.deepEqual(
  //     [...input.matchAll(EMOJIBASE_REGEX_G)]
  //       .map(match => match[0]),
  //     expected,
  //   );
  // });
});

run();
