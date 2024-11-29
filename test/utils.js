// @ts-check

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import fc from 'fast-check';

import {
  takeChar,
  takeCodePoint,
  isBMP,
  isSMP,
  isSIP,
  isTIP,
  isSSP,
} from 'unicode-segmenter/utils';

fc.configureGlobal({
  // Fix seed here for stable coverage report
  seed: 1713140942000,
  numRuns: 100_000,
});

test('takeChar', async t => {
  await t.test('ascii', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'binary-ascii', minLength: 1, maxLength: 1 }),
        // @ts-ignore
        fc.string({ unit: 'grapheme' }),
        (data, extra) => {
          return takeChar(data + extra, 0).length === 1;
        }
      ),
    );
  });

  await t.test('over BMP', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0xffff + 1, max: 0x10ffff }),
        // @ts-ignore
        fc.string({ unit: 'grapheme' }),
        (data, extra) => {
          let leading = String.fromCodePoint(data);
          return takeChar(leading + extra, 0).length === 2;
        },
      ),
    );
  });
});

test('takeCodePoint', async t => {
  await t.test('ascii', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'binary-ascii', minLength: 1, maxLength: 1 }),
        // @ts-ignore
        fc.string({ unit: 'grapheme' }),
        (data, extra) => {
          return takeCodePoint(data + extra, 0) === (data + extra).codePointAt(0);
        },
      ),
    );
  });

  await t.test('over BMP', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0xffff + 1, max: 0x10ffff }),
        // @ts-ignore
        fc.string({ unit: 'grapheme' }),
        (data, extra) => {
          let leading = String.fromCodePoint(data);
          return takeCodePoint(leading + extra, 0) === (leading + extra).codePointAt(0);
        },
      ),
    );
  });
});

test('isBMP', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0, max: 0xffff }),
      // @ts-ignore
      cp => isBMP(cp),
    ),
  );
});

test('isSMP', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0x10000, max: 0x1ffff }),
      // @ts-ignore
      cp => isSMP(cp),
    ),
  );
});

test('isSIP', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0x20000, max: 0x2ffff }),
      // @ts-ignore
      cp => isSIP(cp),
    ),
  );
});

test('isTIP', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0x30000, max: 0x3ffff }),
      // @ts-ignore
      cp => isTIP(cp),
    ),
  );
});

test('isSSP', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0xe0000, max: 0xeffff }),
      // @ts-ignore
      cp => isSSP(cp),
    ),
  );
});
