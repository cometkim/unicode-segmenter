// @ts-check

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
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
      // @ts-ignore
      fc.property(fc.fullUnicode(), data => {
        /** @type {number} */
        // @ts-ignore
        let cp = data.codePointAt(0);
        assert.equal(isLetter(cp), /\p{L}/u.test(data));
      }),
    );
  });
});

test('isNumeric', async t => {
  await t.test('should match \\p{N}', () => {
    fc.assert(
      // @ts-ignore
      fc.property(fc.fullUnicode(), data => {
        /** @type {number} */
        // @ts-ignore
        let cp = data.codePointAt(0);
        assert.equal(isNumeric(cp), /\p{N}/u.test(data));
      }),
    );
  });
});

test('isAlphabetic', async t => {
  await t.test('should match \\p{Alphabetic}(=\\p{Alpha})', () => {
    fc.assert(
      // @ts-ignore
      fc.property(fc.fullUnicode(), data => {
        /** @type {number} */
        // @ts-ignore
        let cp = data.codePointAt(0);
        assert.equal(isAlphabetic(cp), /\p{Alpha}/u.test(data));
      }),
    );
  });
});

test('isAlphanumeric', async t => {
  await t.test('should match [\\p{N}\\p{Alpha}]', () => {
    fc.assert(
      // @ts-ignore
      fc.property(fc.fullUnicode(), data => {
        /** @type {number} */
        // @ts-ignore
        let cp = data.codePointAt(0);
        assert.equal(isAlphanumeric(cp), /[\p{N}\p{Alpha}]/u.test(data));
      }),
    );
  });
});
