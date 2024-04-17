import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import { graphemeSegments, countGraphemes } from 'unicode-segmenter/grapheme';

test('graphemeSegmentes', async t => {
  await t.test('empty string', () => {
    assert.deepEqual([...graphemeSegments('')], []);
  });

  await t.test('ascii', () => {
    assert.deepEqual(
      [...graphemeSegments('abc123')],
      [
        { segment: 'a', index: 0, input: 'abc123' },
        { segment: 'b', index: 1, input: 'abc123' },
        { segment: 'c', index: 2, input: 'abc123' },
        { segment: '1', index: 3, input: 'abc123' },
        { segment: '2', index: 4, input: 'abc123' },
        { segment: '3', index: 5, input: 'abc123' },
      ],
    );
  });

  await t.test('composition', () => {
    assert.deepEqual(
      [...graphemeSegments('a̐éö̲\r\n')],
      [
        { segment: 'a̐', index: 0, input: 'a̐éö̲\r\n' },
        { segment: 'é', index: 2, input: 'a̐éö̲\r\n' },
        { segment: 'ö̲', index: 4, input: 'a̐éö̲\r\n' },
        { segment: '\r\n', index: 7, input: 'a̐éö̲\r\n' },
      ],
    );
  });

  await t.test('flags', () => {
    assert.deepEqual(
      [...graphemeSegments('🇷🇸🇮🇴')],
      [
        { segment: '🇷🇸', index: 0, input: '🇷🇸🇮🇴' },
        { segment: '🇮🇴', index: 4, input: '🇷🇸🇮🇴' },
      ],
    );
  });

  await t.test('flags (incompleted)', () => {
    assert.deepEqual(
      [...graphemeSegments('🇷🇸🇮')],
      [
        { segment: '🇷🇸', index: 0, input: '🇷🇸🇮' },
        { segment: '🇮', index: 4, input: '🇷🇸🇮' },
      ],
    );
  });

  await t.test('emoji', () => {
    assert.deepEqual(
      [...graphemeSegments('👻👩‍👩‍👦‍👦')],
      [
        { segment: '👻', index: 0, input: '👻👩‍👩‍👦‍👦' },
        { segment: '👩‍👩‍👦‍👦', index: 2, input: '👻👩‍👩‍👦‍👦' },
      ],
    );
  });
});

test('countGraphemes', async t => {
  await t.test('flags', () => {
    assert.equal(countGraphemes('🇷🇸🇮🇴'), 2);
  });

  await t.test('emoji', () => {
    assert.equal(countGraphemes('👻👩‍👩‍👦‍👦'), 2);
  });
});
