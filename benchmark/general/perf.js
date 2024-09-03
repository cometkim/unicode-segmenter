import * as assert from 'node:assert/strict';
import { group, baseline, bench, run } from 'mitata';
import XRegExp from 'xregexp';

import { isBMP } from '../../src/utils.js';
import { isAlphanumeric } from '../../src/general.js';

group('checking any alphanumeric', () => {
  /**
   * @param {string} input
   */
  function anyAlnum(input) {
    let cursor = 0;
    let len = input.length;
    while (cursor < len) {
      let cp = input.codePointAt(cursor);
      if (isAlphanumeric(cp)) {
        return true;
      }
      cursor += isBMP(cp) ? 1 : 2;
    }
    return false;
  }

  let REGEXP_U = /[\p{N}\p{Alpha}]/u;
  let XREGEXP_U = XRegExp('[\\pN\\p{Alphabetic}]', 'u');

  let input = '😂_@!$💯𐅩X六';

  assert.equal(anyAlnum(input), true);
  assert.equal(REGEXP_U.test(input), true);
  assert.equal(XREGEXP_U.test(input), true);

  baseline('unicode-segmenter/general', () => {
    void anyAlnum(input);
  });

  bench('XRegExp', () => {
    void XREGEXP_U.test(input);
  });

  bench('RegExp w/ unicode', () => {
    void REGEXP_U.test(input);
  });
});

group('match all alphanumeric', () => {
  function *matchAllAlnum(input) {
    let cursor = 0;
    let len = input.length;
    while (cursor < len) {
      let cp = input.codePointAt(cursor);
      let ch = String.fromCodePoint(cp);
      if (isAlphanumeric(cp)) {
        yield ch;
      }
      cursor += ch.length;
    }
  }

  let REGEXP_UG = /[\p{N}\p{Alpha}]/ug;
  let XREGEXP_UG = XRegExp('[\\pN\\p{Alphabetic}]', 'ug');

  let input = '😂_@!$💯X六';
  let expected = ['X', '六'];

  assert.deepEqual([...matchAllAlnum(input)], expected);
  assert.deepEqual([...input.matchAll(REGEXP_UG)].map(match => match[0]), expected);
  assert.deepEqual([...input.matchAll(XREGEXP_UG)].map(match => match[0]), expected);

  baseline('unicode-segmenter/general', () => {
    void [...matchAllAlnum(input)];
  });

  bench('XRegExp', () => {
    void [...input.matchAll(XREGEXP_UG)];
  });

  bench('RegExp w/ unicode', () => {
    void [...input.matchAll(REGEXP_UG)];
  });
});

await run();
