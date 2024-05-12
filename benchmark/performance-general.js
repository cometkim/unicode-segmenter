import * as assert from 'node:assert/strict';
import { group, bench, run } from 'mitata';
import XRegExp from 'xregexp';

import { takeChar } from '../src/utils.js';
import { isAlphanumeric } from '../src/general.js';
import { graphemeSegments } from '../src/grapheme.js';

group('checking any alphanumeric', () => {
  function anyAlnum(input) {
    let cursor = 0;
    let len = input.length;
    while (cursor < len) {
      let ch = takeChar(input, cursor);
      let cp = ch.codePointAt(0);
      if (isAlphanumeric(cp)) {
        return true;
      }
      cursor += ch.length;
    }
    return false;
  }

  let input = '😂_@!$💯𐅩X六';

  bench('unicode-segmenter/general', () => {
    assert.equal(anyAlnum(input), true);
  });

  bench('RegExp w/ unicode', () => {
    assert.equal(/[\p{N}\p{Alpha}]/u.test(input), true);
  });

  let xe = XRegExp('[\\pN\\p{Alphabetic}]', 'u');
  bench('XRegExp', () => {
    assert.equal(xe.test(input), true);
  });
});

group('match all alphanumeric', () => {
  function *matchAlnum(input) {
    for (let { index, segment } of graphemeSegments(input)) {
      if (isAlphanumeric(input.codePointAt(index))) {
        yield Object.assign([segment], { index, input, groups: undefined });
      }
    }
  }

  let input = '😂_@!$💯X六';
  let expected = [
    // XRegExp has very old Unicode version
    // Object.assign(['𐅩'], { index: 8, input, groups: undefined }),
    Object.assign(['X'], { index: 8, input, groups: undefined }),
    Object.assign(['六'], { index: 9, input, groups: undefined }),
  ];

  bench('unicode-segmenter/general', () => {
    assert.deepEqual([...matchAlnum(input)], expected);
  });

  bench('RegExp w/ unicode', () => {
    assert.deepEqual([...input.matchAll(/[\p{N}\p{Alpha}]/ug)], expected);
  });

  let xe = XRegExp('[\\pN\\p{Alphabetic}]', 'ug');
  bench('XRegExp', () => {
    assert.deepEqual([...input.matchAll(xe)], expected);
  });
});

run();
