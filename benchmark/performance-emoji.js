import * as assert from 'node:assert/strict';
import { group, bench, run } from 'mitata';
import emojiRegex from 'emoji-regex';

import { takeChar } from '../src/utils.js';
import { isEmoji } from '../src/emoji.js';
import { graphemeSegments, GraphemeCategory } from '../src/grapheme.js';

group('checking if any emoji', () => {
  function anyEmoji(input) {
    let cursor = 0;
    let len = input.length;
    while (cursor < len) {
      let ch = takeChar(input, cursor);
      let cp = ch.codePointAt(0);
      if (isEmoji(cp)) {
        return true;
      }
      cursor += ch.length;
    }
    return false;
  }

  // emoji-regex does not fully comply with the Extended_Pictographic property
  // let input = 'aaaaa😂💯♡⌨';
  let input = 'aaaaa😂💯⌨';

  bench('unicode-segmenter/emoji', () => {
    assert.equal(anyEmoji(input), true);
  });

  bench('RegExp w/ unicode', () => {
    assert.equal(/\p{Extended_Pictographic}/u.test(input), true);
  });

  let e = emojiRegex();
  bench('emoji-regex', () => {
    assert.equal(e.test(input), true, 'not match');
  });
});

group('match all emoji', () => {
  function *matchEmoji(str) {
    for (let { index, segment, input, _cat } of graphemeSegments(str)) {
      if (_cat === GraphemeCategory.Extended_Pictographic) {
        yield Object.assign([segment], { index, input, groups: undefined });
      }
    }
  }

  // emoji-regex does not fully comply with the Extended_Pictographic property
  // let input = 'aaaaa😂💯♡⌨';
  let input = 'aaaaa😂💯⌨';
  let expected = [
    Object.assign(['😂'], { index: 5, input, groups: undefined }),
    Object.assign(['💯'], { index: 7, input, groups: undefined }),
    // Object.assign(['♡'], { index: 9, input, groups: undefined }),
    // Object.assign(['⌨'], { index: 10, input, groups: undefined }),
    Object.assign(['⌨'], { index: 9, input, groups: undefined }),
  ];

  bench('unicode-segmenter/emoji', () => {
    assert.deepEqual([...matchEmoji(input)], expected);
  });

  bench('RegExp w/ unicode', () => {
    assert.deepEqual([...input.matchAll(/\p{Extended_Pictographic}/ug)], expected);
  });

  let e = emojiRegex();
  bench('emoji-regex', () => {
    assert.deepEqual([...input.matchAll(e)], expected);
  });
});

run();
