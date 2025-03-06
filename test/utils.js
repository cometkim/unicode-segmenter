// @ts-check

import { test } from 'node:test';
import fc from 'fast-check';

import {
  isBMP,
  isSMP,
  isSIP,
  isTIP,
  isSSP,
  isHighSurrogate,
  isLowSurrogate,
  surrogatePairToCodePoint,
} from 'unicode-segmenter/utils';

fc.configureGlobal({
  // Fix seed here for stable coverage report
  seed: 1713140942000,
  numRuns: 100_000,
});

test('surrogate pairs', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 0xffff + 1, max: 0xeffff }),
      // @ts-ignore
      cp => {
        let ch = String.fromCodePoint(cp);
        let hi = ch.charCodeAt(0);
        let lo = ch.charCodeAt(1);
        return (
          isHighSurrogate(hi) &&
          isLowSurrogate(lo) &&
          cp === surrogatePairToCodePoint(hi, lo)
        );
      }
    )
  )
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
