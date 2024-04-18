// @ts-check

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import fc from 'fast-check';

import {
  isEmoji,
  isEmojiPresentation,
} from 'unicode-segmenter/emoji';

fc.configureGlobal({
  // Fix seed here for stable coverage report
  seed: 1713140942000,
  numRuns: 100_000,
});

test('isEmoji', async t => {
  await t.test('should match \\p{Extended_Pictographic}', () => {
    fc.assert(
      // @ts-ignore
      fc.property(fc.fullUnicode(), data => {
        /** @type {number} */
        // @ts-ignore
        let cp = data.codePointAt(0);
        assert.equal(isEmoji(cp), /\p{Extended_Pictographic}/u.test(data));
      }),
    );
  });
});

test('isEmojiPresentation', async t => {
  await t.test('should match \\p{Extended_Pictographic}', () => {
    fc.assert(
      // @ts-ignore
      fc.property(fc.fullUnicode(), data => {
        /** @type {number} */
        // @ts-ignore
        let cp = data.codePointAt(0);
        assert.equal(isEmojiPresentation(cp), /\p{Emoji_Presentation}/u.test(data));
      }),
    );
  });
});
