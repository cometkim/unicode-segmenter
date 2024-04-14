import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { Segmenter } from 'unicode-segmenter/intl-adapter';

test('idempotency', async t => {
  let segmenter = new Segmenter();
  let intlSegmenter = new Intl.Segmenter();

  let cases = [
    '',
    'abc123',
    'a̐éö̲\r\n',
    '🇷🇸🇮🇴' ,
    '🇷🇸🇮',
    '👻👩‍👩‍👦‍👦',
  ];

  for (let input of cases) {
    await t.test(input, () => {
      assert.deepEqual(
        [...intlSegmenter.segment(input)],
        [...segmenter.segment(input)],
      );
    });
  }
});

test('containing', async _ => {
  let segmenter = new Segmenter();
  let segments = segmenter.segment('a̐éö̲\r\n');

  assert.deepEqual(
    segments.containing(0),
    { segment: 'a̐', index: 0, input: 'a̐éö̲\r\n' },
  );
  assert.deepEqual(
    segments.containing(1),
    { segment: 'a̐', index: 0, input: 'a̐éö̲\r\n' },
  );
  assert.deepEqual(
    segments.containing(2),
    { segment: 'é', index: 2, input: 'a̐éö̲\r\n' },
  );
  assert.deepEqual(
    segments.containing(3),
    { segment: 'é', index: 2, input: 'a̐éö̲\r\n' },
  );
  assert.deepEqual(
    segments.containing(4),
    { segment: 'ö̲', index: 4, input: 'a̐éö̲\r\n' },
  );
  assert.deepEqual(
    segments.containing(5),
    { segment: 'ö̲', index: 4, input: 'a̐éö̲\r\n' },
  );
  assert.deepEqual(
    segments.containing(6),
    { segment: 'ö̲', index: 4, input: 'a̐éö̲\r\n' },
  );
  assert.deepEqual(
    segments.containing(7),
    { segment: '\r\n', index: 7, input: 'a̐éö̲\r\n' },
  );
  assert.deepEqual(
    segments.containing(8),
    { segment: '\r\n', index: 7, input: 'a̐éö̲\r\n' },
  );
  assert.equal(segments.containing(9), undefined);
});

test('unsupported options', async t => {
  await t.test('granularity: unknown', () => {
    assert.throws(
      () => new Segmenter('lang' , { granularity: 'unknown' }),
      RangeError,
    );
  });

  await t.test('granularity: word', () => {
    assert.throws(
      () => new Segmenter('lang' , { granularity: 'word' }),
      TypeError,
    );
  });

  await t.test('granularity: sentence', () => {
   assert.throws(
      () => new Segmenter('lang' , { granularity: 'sentence' }),
      TypeError,
    );
  });
});
