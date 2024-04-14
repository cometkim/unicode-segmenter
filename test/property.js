import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import fc from 'fast-check';

import { graphemeSegments } from 'unicode-segmenter/grapheme';

fc.configureGlobal({
  numRuns: 100_000,
});

test('pbt using fast-check', async t => {
  await t.test('ascii', () => {
    fc.assert(
      fc.property(fc.asciiString(), data => {
        assert.doesNotThrow(
          () => void [...graphemeSegments(data)],
        );
      }),
    );
  });

  await t.test('unicode', () => {
    fc.assert(
      fc.property(fc.unicodeString(), data => {
        assert.doesNotThrow(
          () => void [...graphemeSegments(data)],
        );
      }),
    );
  });

  await t.test('utf-16', () => {
    fc.assert(
      fc.property(fc.string16bits(), data => {
        assert.doesNotThrow(
          () => void [...graphemeSegments(data)],
        );
      }),
    );
  });
});

test('Counterexample: "\udbfc"', () => {
  assert.deepEqual(
    [...graphemeSegments('\udbfc')],
    [
      { segment: '\udbfc', index: 0, input: '\udbfc' },
      { segment: '', index: 1, input: '\udbfc' },
    ],
  );
});

test('Counterexample: "\udbf9"', () => {
  assert.deepEqual(
    [...graphemeSegments('\udbf9')],
    [
      { segment: '\udbf9', index: 0, input: '\udbf9' },
      { segment: '', index: 1, input: '\udbf9' },
    ],
  );
});
