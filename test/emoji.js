// @ts-check

import { test } from 'node:test';
import fc from 'fast-check';

import {
  isEmoji,
  isEmojiPresentation,
  isExtendedPictographic,
} from 'unicode-segmenter/emoji';

fc.configureGlobal({
  // Fix seed here for stable coverage report
  seed: 1713140942000,
  numRuns: 100_000,
});

test('isEmoji', async t => {
  await t.test('should match \\p{Extended_Pictographic}', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme', minLength: 1, maxLength: 1 }),
        // @ts-ignore
        str => {
          let cp = /** @type {number} */ (str.codePointAt(0));
          return isEmoji(cp) === isExtendedPictographic(cp);
        },
      ),
    );
  });
});

test('isEmojiPresentation', async t => {
  await t.test('should match \\p{Extended_Pictographic}', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme', minLength: 1, maxLength: 1 }),
        // @ts-ignore
        str => {
          let cp = /** @type {number} */ (str.codePointAt(0));
          return isEmojiPresentation(cp) === /\p{Emoji_Presentation}/u.test(str);
        },
      ),
    );
  });
});

test('isExtendedPictographic', async t => {
  await t.test('should match \\p{Extended_Pictographic}', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme', minLength: 1, maxLength: 1 }),
        // @ts-ignore
        str => {
          let cp = /** @type {number} */ (str.codePointAt(0));
          return isExtendedPictographic(cp) === /\p{Extended_Pictographic}/u.test(str);
        },
      ),
    );
  });
});
