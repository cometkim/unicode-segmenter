// @ts-check

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import fc from 'fast-check';
import { assertObjectContaining } from './_helper.js';

import { GraphemeCategory } from 'unicode-segmenter/grapheme';
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
      assertObjectContaining(
        [...segmenter.segment(input)],
        [...intlSegmenter.segment(input)],
      );
    });
  }
});

test('containing', async _ => {
  let segmenter = new Segmenter();
  let segments = segmenter.segment('a̐éö̲\r\n');

  assert.deepEqual(
    segments.containing(0),
    { segment: 'a̐', index: 0, input: 'a̐éö̲\r\n', _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Extend },
  );
  assert.deepEqual(
    segments.containing(1),
    { segment: 'a̐', index: 0, input: 'a̐éö̲\r\n', _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Extend },
  );
  assert.deepEqual(
    segments.containing(2),
    { segment: 'é', index: 2, input: 'a̐éö̲\r\n', _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Extend },
  );
  assert.deepEqual(
    segments.containing(3),
    { segment: 'é', index: 2, input: 'a̐éö̲\r\n', _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Extend },
  );
  assert.deepEqual(
    segments.containing(4),
    { segment: 'ö̲', index: 4, input: 'a̐éö̲\r\n', _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Extend },
  );
  assert.deepEqual(
    segments.containing(5),
    { segment: 'ö̲', index: 4, input: 'a̐éö̲\r\n', _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Extend },
  );
  assert.deepEqual(
    segments.containing(6),
    { segment: 'ö̲', index: 4, input: 'a̐éö̲\r\n', _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Extend },
  );
  assert.deepEqual(
    segments.containing(7),
    { segment: '\r\n', index: 7, input: 'a̐éö̲\r\n', _catBegin: GraphemeCategory.CR, _catEnd: GraphemeCategory.LF },
  );
  assert.deepEqual(
    segments.containing(8),
    { segment: '\r\n', index: 7, input: 'a̐éö̲\r\n', _catBegin: GraphemeCategory.CR, _catEnd: GraphemeCategory.LF  },
  );
  assert.equal(segments.containing(9), undefined);
});

test('resolvedOptions', async t => {
  await t.test('locale default', () => {
    let segmenter = new Segmenter();
    let { locale } = segmenter.resolvedOptions();
    assert.equal(locale, 'en');
  });

  await t.test('locale as-is', () => {
    fc.assert(
      // @ts-ignore
      fc.property(fc.asciiString({ minLength: 2 }), (inputLocale) => {
        let segmenter = new Segmenter(inputLocale);
        let { locale } = segmenter.resolvedOptions();
        assert.equal(locale, inputLocale);
      }),
    );
  });

  await t.test('granularity default', () => {
    assert.equal(
      new Segmenter('locale').resolvedOptions().granularity,
      'grapheme',
    );
  });

  await t.test('granularity as-is', () => {
    assert.equal(
      new Segmenter('locale', { granularity: 'grapheme' }).resolvedOptions().granularity,
      'grapheme',
    );
    // assert.equal(
    //   new Segmenter('locale', { granularity: 'word' }).resolvedOptions().granularity,
    //   'word',
    // );
    // assert.equal(
    //   new Segmenter('locale', { granularity: 'sentence' }).resolvedOptions().granularity,
    //   'sentence',
    // );
  });
});

test('unsupported options', async t => {
  await t.test('granularity: unknown', () => {
    assert.throws(
      // @ts-expect-error
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
