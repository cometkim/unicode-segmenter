// @ts-check

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import fc from 'fast-check';

import { graphemeSegments, countGrapheme, GraphemeCategory } from 'unicode-segmenter/grapheme';
import { assertObjectContaining } from './_helper.js';

test('graphemeSegments', async t => {
  await t.test('empty string', () => {
    assert.deepEqual([...graphemeSegments('')], []);
  });

  await t.test('ascii', () => {
    assert.deepEqual(
      [...graphemeSegments('abc123')],
      [
        { segment: 'a', index: 0, input: 'abc123', _cat: GraphemeCategory.Any },
        { segment: 'b', index: 1, input: 'abc123', _cat: GraphemeCategory.Any },
        { segment: 'c', index: 2, input: 'abc123', _cat: GraphemeCategory.Any },
        { segment: '1', index: 3, input: 'abc123', _cat: GraphemeCategory.Any },
        { segment: '2', index: 4, input: 'abc123', _cat: GraphemeCategory.Any },
        { segment: '3', index: 5, input: 'abc123', _cat: GraphemeCategory.Any },
      ],
    );
  });

  await t.test('composition', () => {
    assert.deepEqual(
      [...graphemeSegments('a̐éö̲\r\n')],
      [
        { segment: 'a̐', index: 0, input: 'a̐éö̲\r\n', _cat: GraphemeCategory.Extend },
        { segment: 'é', index: 2, input: 'a̐éö̲\r\n', _cat: GraphemeCategory.Extend },
        { segment: 'ö̲', index: 4, input: 'a̐éö̲\r\n', _cat: GraphemeCategory.Extend },
        { segment: '\r\n', index: 7, input: 'a̐éö̲\r\n', _cat: GraphemeCategory.LF },
      ],
    );
  });

  await t.test('flags', () => {
    assert.deepEqual(
      [...graphemeSegments('🇷🇸🇮🇴')],
      [
        { segment: '🇷🇸', index: 0, input: '🇷🇸🇮🇴', _cat: GraphemeCategory.Regional_Indicator },
        { segment: '🇮🇴', index: 4, input: '🇷🇸🇮🇴', _cat: GraphemeCategory.Regional_Indicator },
      ],
    );
  });

  await t.test('flags (incompleted)', () => {
    assert.deepEqual(
      [...graphemeSegments('🇷🇸🇮')],
      [
        { segment: '🇷🇸', index: 0, input: '🇷🇸🇮', _cat: GraphemeCategory.Regional_Indicator },
        { segment: '🇮', index: 4, input: '🇷🇸🇮', _cat: GraphemeCategory.Regional_Indicator },
      ],
    );
  });

  await t.test('emoji', () => {
    assert.deepEqual(
      [...graphemeSegments('👻👩‍👩‍👦‍👦')],
      [
        { segment: '👻', index: 0, input: '👻👩‍👩‍👦‍👦', _cat: GraphemeCategory.Extended_Pictographic },
        { segment: '👩‍👩‍👦‍👦', index: 2, input: '👻👩‍👩‍👦‍👦', _cat: GraphemeCategory.Extended_Pictographic },
      ],
    );
  });
});

test('countGrapheme', async t => {
  await t.test('latin', () => {
    assert.equal(countGrapheme('abcd'), 4);
  });

  await t.test('latin', () => {
    assert.equal(countGrapheme('abcd'), 4);
  });

  await t.test('flags', () => {
    assert.equal(countGrapheme('🇷🇸🇮🇴'), 2);
  });

  await t.test('emoji', () => {
    assert.equal(countGrapheme('👻👩‍👩‍👦‍👦'), 2);
    assert.equal(countGrapheme('🌷🎁💩😜👍🏳️‍🌈'), 6);
  });

  await t.test('diacritics as combining marks', () => {
    assert.equal(countGrapheme('Ĺo͂řȩm̅'), 5);
  });

  await t.test('Jamo', () => {
    assert.equal(countGrapheme('뎌쉐'), 2);
  });

  await t.test('Hindi', () => {
    assert.equal(countGrapheme('अनुच्छेद'), 5);
  });

  await t.test('demonic', () => {
    assert.equal(countGrapheme('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞'), 6);
  });
});

test('spec compliant', async t => {
  fc.configureGlobal({
    // Fix seed here for stable coverage report
    seed: 1713140942000,
    numRuns: 100_000,
  });

  let intlSegmenter = new Intl.Segmenter();

  await t.test('ascii string', () => {
    fc.assert(
      // @ts-ignore
      fc.property(fc.asciiString(), (data) => {
        assertObjectContaining(
          [...graphemeSegments(data)],
          [...intlSegmenter.segment(data)],
        );
      }),
    );
  });

  await t.test('BMP string', () => {
    fc.assert(
      // @ts-ignore
      fc.property(fc.unicodeString(), data => {
        assertObjectContaining(
          [...graphemeSegments(data)],
          [...intlSegmenter.segment(data)],
        );
      }),
    );
  });

  await t.test('unicode string', () => {
    fc.assert(
      // @ts-ignore
      fc.property(fc.fullUnicodeString(), data => {
        assertObjectContaining(
          [...graphemeSegments(data)],
          [...intlSegmenter.segment(data)],
        );
      }),
    );
  });

  await t.test('16bits', () => {
    fc.assert(
      // @ts-ignore
      fc.property(fc.string16bits(), data => {
        assertObjectContaining(
          [...graphemeSegments(data)],
          [...intlSegmenter.segment(data)],
        );
      }),
    );
  });
});

test('counter examples', async t => {
  let intlSegmenter = new Intl.Segmenter();

  // Add here if you find somee counter exmaples
  let counterExamples = [
    '\udbfc',
    '\udbf9',
    ' ᯪ',
    '܏ ',
    '‍☀',
    '  ‍◻',
    '‍◻',
    '🇷‍◻',
    '🇷🇸A',
    '👩‍🦰👩‍👩‍👦‍👦🏳️‍🌈',
  ];

  for (let counter of counterExamples) {
    await t.test(`Counterexample: ["${counter}"]`, () => {
      assertObjectContaining(
        [...graphemeSegments(counter)],
        [...intlSegmenter.segment(counter)],
      );
    });
  }
});
