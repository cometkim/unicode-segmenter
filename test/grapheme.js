// @ts-check

import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import fc from 'fast-check';

import {
  GraphemeCategory,
  graphemeSegments,
  splitGraphemes,
  countGraphemes,
} from 'unicode-segmenter/grapheme';
import { assertObjectContaining } from './_helper.js';

test('graphemeSegments', async t => {
  await t.test('empty string', () => {
    assert.deepEqual([...graphemeSegments('')], []);
  });

  await t.test('ascii', () => {
    assert.deepEqual(
      [...graphemeSegments('abc123')],
      [
        { segment: 'a', index: 0, input: 'abc123', _hd: 'a'.codePointAt(0), _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Any },
        { segment: 'b', index: 1, input: 'abc123', _hd: 'b'.codePointAt(0), _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Any },
        { segment: 'c', index: 2, input: 'abc123', _hd: 'c'.codePointAt(0), _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Any },
        { segment: '1', index: 3, input: 'abc123', _hd: '1'.codePointAt(0), _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Any },
        { segment: '2', index: 4, input: 'abc123', _hd: '2'.codePointAt(0), _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Any },
        { segment: '3', index: 5, input: 'abc123', _hd: '3'.codePointAt(0), _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Any },
      ],
    );
  });

  await t.test('composition', () => {
    assert.deepEqual(
      [...graphemeSegments('a̐éö̲\r\n')],
      [
        { segment: 'a̐', index: 0, input: 'a̐éö̲\r\n', _hd: 'a̐'.codePointAt(0), _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Extend },
        { segment: 'é', index: 2, input: 'a̐éö̲\r\n', _hd: 'é'.codePointAt(0), _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Extend },
        { segment: 'ö̲', index: 4, input: 'a̐éö̲\r\n', _hd: 'ö̲'.codePointAt(0), _catBegin: GraphemeCategory.Any, _catEnd: GraphemeCategory.Extend },
        { segment: '\r\n', index: 7, input: 'a̐éö̲\r\n', _hd: '\r\n'.codePointAt(0), _catBegin: GraphemeCategory.CR, _catEnd: GraphemeCategory.LF },
      ],
    );
  });

  await t.test('flags', () => {
    assert.deepEqual(
      [...graphemeSegments('🇷🇸🇮🇴')],
      [
        { segment: '🇷🇸', index: 0, input: '🇷🇸🇮🇴', _hd: '🇷🇸'.codePointAt(0), _catBegin: GraphemeCategory.Regional_Indicator, _catEnd: GraphemeCategory.Regional_Indicator },
        { segment: '🇮🇴', index: 4, input: '🇷🇸🇮🇴', _hd: '🇮🇴'.codePointAt(0), _catBegin: GraphemeCategory.Regional_Indicator, _catEnd: GraphemeCategory.Regional_Indicator },
      ],
    );
  });

  await t.test('flags (incompleted)', () => {
    assert.deepEqual(
      [...graphemeSegments('🇷🇸🇮')],
      [
        { segment: '🇷🇸', index: 0, input: '🇷🇸🇮', _hd: '🇷🇸'.codePointAt(0), _catBegin: GraphemeCategory.Regional_Indicator, _catEnd: GraphemeCategory.Regional_Indicator },
        { segment: '🇮', index: 4, input: '🇷🇸🇮', _hd: '🇮'.codePointAt(0), _catBegin: GraphemeCategory.Regional_Indicator, _catEnd: GraphemeCategory.Regional_Indicator },
      ],
    );
  });

  await t.test('emoji', () => {
    assert.deepEqual(
      [...graphemeSegments('👻👩‍👩‍👦‍👦')],
      [
        { segment: '👻', index: 0, input: '👻👩‍👩‍👦‍👦', _hd: '👻'.codePointAt(0), _catBegin: GraphemeCategory.Extended_Pictographic, _catEnd: GraphemeCategory.Extended_Pictographic },
        { segment: '👩‍👩‍👦‍👦', index: 2, input: '👻👩‍👩‍👦‍👦', _hd: '👩‍👩‍👦‍👦'.codePointAt(0), _catBegin: GraphemeCategory.Extended_Pictographic, _catEnd: GraphemeCategory.Extended_Pictographic },
      ],
    );
  });
});

test('countGraphemes', async t => {
  await t.test('latin', () => {
    assert.equal(countGraphemes('abcd'), 4);
  });

  await t.test('flags', () => {
    assert.equal(countGraphemes('🇷🇸🇮🇴'), 2);
  });

  await t.test('emoji', () => {
    assert.equal(countGraphemes('👻👩‍👩‍👦‍👦'), 2);
    assert.equal(countGraphemes('🌷🎁💩😜👍🏳️‍🌈'), 6);
  });

  await t.test('diacritics as combining marks', () => {
    assert.equal(countGraphemes('Ĺo͂řȩm̅'), 5);
  });

  await t.test('Jamo', () => {
    assert.equal(countGraphemes('뎌쉐'), 2);
  });

  await t.test('Hindi', () => {
    assert.equal(countGraphemes('अनुच्छेद'), 4);
  });

  await t.test('demonic', () => {
    assert.equal(countGraphemes('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞'), 6);
  });
});

test('splitGrapheme', async t => {
  await t.test('latin', () => {
    assert.deepEqual(
      [...splitGraphemes('abcd')],
      ['a', 'b', 'c', 'd'],
    );
  });

  await t.test('flags', () => {
    assert.deepEqual(
      [...splitGraphemes('🇷🇸🇮🇴')],
      ['🇷🇸', '🇮🇴'],
    );
  });

  await t.test('emoji', () => {
    assert.deepEqual(
      [...splitGraphemes('👻👩‍👩‍👦‍👦')],
      ['👻', '👩‍👩‍👦‍👦'],
    );
    assert.deepEqual(
      [...splitGraphemes('🌷🎁💩😜👍🏳️‍🌈')],
      ['🌷', '🎁', '💩', '😜', '👍', '🏳️‍🌈'],
    );
  });

  await t.test('diacritics as combining marks', () => {
    assert.deepEqual(
      [...splitGraphemes('Ĺo͂řȩm̅')],
      ['Ĺ', 'o͂', 'ř', 'ȩ', 'm̅'],
    );
  });

  await t.test('Jamo', () => {
    assert.deepEqual(
      [...splitGraphemes('가갉')],
      ['가', '갉'],
    );
  });

  await t.test('Hindi', () => {
    assert.deepEqual(
      [...splitGraphemes('अनुच्छेद')],
      ['अ', 'नु', 'च्छे', 'द'],
    );
  });

  await t.test('demonic', () => {
    assert.deepEqual(
      [...splitGraphemes('Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞')],
      ['Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍', 'A̴̵̜̰͔ͫ͗͢', 'L̠ͨͧͩ͘', 'G̴̻͈͍͔̹̑͗̎̅͛́', 'Ǫ̵̹̻̝̳͂̌̌͘', '!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞'],
    );
  });
});

test('spec compliant', async t => {
  fc.configureGlobal({
    // Fix seed here for stable coverage report
    seed: 1713140942000,
    numRuns: 100_000,
  });

  let intlSegmenter = new Intl.Segmenter();

  await t.test('any string', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'binary' }),
        // @ts-ignore
        str => {
          assertObjectContaining(
            [...graphemeSegments(str)],
            [...intlSegmenter.segment(str)],
          );
        },
      ),
    );
  });

  await t.test('binary', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'binary' }),
        // @ts-ignore
        str => {
          assertObjectContaining(
            [...graphemeSegments(str)],
            [...intlSegmenter.segment(str)],
          );
        },
      ),
    );
  });

  await t.test('binary (ascii)', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'binary-ascii' }),
        // @ts-ignore
        str => {
          assertObjectContaining(
            [...graphemeSegments(str)],
            [...intlSegmenter.segment(str)],
          );
        },
      ),
    );
  });

  await t.test('grapheme', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme' }),
        // @ts-ignore
        str => {
          assertObjectContaining(
            [...graphemeSegments(str)],
            [...intlSegmenter.segment(str)],
          );
        },
      ),
    );
  });

  await t.test('grapheme (ascii)', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme-ascii' }),
        // @ts-ignore
        str => {
          assertObjectContaining(
            [...graphemeSegments(str)],
            [...intlSegmenter.segment(str)],
          );
        },
      ),
    );
  });

  await t.test('grapheme (composite)', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme-composite' }),
        // @ts-ignore
        str => {
          assertObjectContaining(
            [...graphemeSegments(str)],
            [...intlSegmenter.segment(str)],
          );
        },
      ),
    );
  });
});

test('counterexamples', async t => {
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
    'अनुच्छेद',
    'पक्षियों',
    'क्‍त',
    '് ',
    '्क',
    'গ্‌ডু',
    'স্ট্‌মা',
    'আপি',
    'স্ট্‌মা',
    'ল্‌জ্ব',
    'এবং',
    'ল্‌ছ',
    ' ক',
    ' വ',
    ' ക',
    ' വൃ',
    ' പു',
    ' യ',
    ' പോ',
    ' ജോ',
    ' നീ',
    'എന്നാ',
    'ഡ്‌ഢി',
    'ഇനി',
    'ഉദ്യോ',
    ' താ',
    ' ദു',
    ' ബു',
    'ഒര',
    ' जा',
    ' କା',
    ' ଶ୍ୟା',
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

test('break category', async t => {
  let cats = {
    Extended_Pictographic: [
      '🏴',
      '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    ],
  };

  for (let [cat, cases] of Object.entries(cats)) {
    for (let case_ of cases) {
      // @ts-ignore
      let expected = GraphemeCategory[cat];
      await t.test(`cat(${case_}) = ${cat} (${expected})`, () => {
        assert.equal(
          graphemeSegments(case_).next().value._catBegin,
          expected,
        );
      });
    }
  }
})
