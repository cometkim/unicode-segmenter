// @ts-check

import { test } from 'node:test';
import fc from 'fast-check';

import {
  isLetter,
  isNumeric,
  isAlphabetic,
  isAlphanumeric,
} from 'unicode-segmenter/general';

fc.configureGlobal({
  // Fix seed here for stable coverage report
  seed: 1713140942000,
  numRuns: 100_000,
});

test('isLetter', async t => {
  await t.test('should match \\p{L}', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme', minLength: 1, maxLength: 1 }),
        // @ts-ignore
        str => {
          let cp = /** @type {number} */ (str.codePointAt(0));
          return isLetter(cp) === /\p{L}/u.test(str);
        },
      ),
    );
  });
});

test('isNumeric', async t => {
  await t.test('should match \\p{N}', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme', minLength: 1, maxLength: 1 }),
        // @ts-ignore
        str => {
          let cp = /** @type {number} */ (str.codePointAt(0));
          return isNumeric(cp) === /\p{N}/u.test(str);
        }
      ),
    );
  });
});

test('isAlphabetic', async t => {
  await t.test('should match \\p{Alphabetic}(=\\p{Alpha})', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme', minLength: 1, maxLength: 1 }),
        // @ts-ignore
        str => {
          let cp = /** @type {number} */ (str.codePointAt(0));
          return isAlphabetic(cp) === /\p{Alpha}/u.test(str);
        },
      ),
    );
  });
});

test('isAlphanumeric', async t => {
  await t.test('should match [\\p{N}\\p{Alpha}]', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme', minLength: 1, maxLength: 1 }),
        // @ts-ignore
        str => {
          let cp = /** @type {number} */ (str.codePointAt(0));
          return isAlphanumeric(cp) === /[\p{N}\p{Alpha}]/u.test(str);
        },
      ),
    );
  });
});
