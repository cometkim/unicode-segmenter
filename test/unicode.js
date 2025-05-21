// @ts-check

import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import { graphemeSegments } from 'unicode-segmenter/grapheme';
import { wordSegments } from 'unicode-segmenter/word';

import { TESTDATA_GRAPHEME, TESTDATA_WORD } from './_unicode_testdata.js';

test('Unicode® official test suite', async t => {
  await t.test('extended grapheme clusters', () => {
    /** @param {string} str */
    function* segments(str) {
      for (let { segment } of graphemeSegments(str)) {
        yield segment;
      }
    }
    for (let [input, expected] of TESTDATA_GRAPHEME) {
      assert.deepEqual([...segments(input)], expected);
    }
  });

  await t.test('word break', () => {
    /** @param {string} str */
    function* segments(str) {
      for (let { segment } of wordSegments(str)) {
        yield segment;
      }
    }
    for (let [input, expected] of TESTDATA_WORD) {
      assert.deepEqual([...segments(input)], expected);
    }
  });
});
