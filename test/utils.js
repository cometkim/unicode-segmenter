// @ts-check

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import fc from 'fast-check';

import { takeChar } from 'unicode-segmenter/utils';

fc.configureGlobal({
  // Fix seed here for stable coverage report
  seed: 1713140942000,
  numRuns: 100_000,
});

test('takeChar', async t => {
  await t.test('ascii', () => {
    fc.assert(
      // @ts-ignore
      fc.property(fc.ascii(), fc.fullUnicodeString(), (data, extra) => {
        assert.equal(takeChar(data + extra, 0).length, 1);
      }),
    );
  });

  await t.test('char16bits', () => {
    fc.assert(
      // @ts-ignore
      fc.property(fc.char16bits(), fc.fullUnicodeString(), (data, extra) => {
        assert.equal(takeChar(data + extra, 0).length, 1);
      }),
    );
  });

  await t.test('utf-8 (3-bytes)', () => {
    fc.assert(
      fc.property(
        // @ts-ignore
        fc.integer({ min: 0xffff + 1, max: 0x10ffff }), fc.fullUnicodeString(), (data, extra) => {
          let leading = String.fromCodePoint(data);
          assert.equal(takeChar(leading + extra, 0).length, 2);
        },
      ),
    );
  });
});

