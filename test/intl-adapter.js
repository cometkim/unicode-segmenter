import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { Segmenter } from 'unicode-segmenter/intl-adapter';

let segmenter = new Segmenter();
let intlSegmenter = new Intl.Segmenter();

let cases = [
  'abc123',
  'a̐éö̲\r\n',
  '🇷🇸🇮🇴' ,
  '🇷🇸🇮',
  '👻👩‍👩‍👦‍👦',
];

test('idempotency', async t => {
  for (let input of cases) {
    await t.test(input, () => {
      assert.deepEqual(
        [...intlSegmenter.segment(input)],
        [...segmenter.segment(input)],
      );
    });
  }
});
