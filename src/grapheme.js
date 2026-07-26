// @ts-check

import { decodeUnicodeData, findUnicodeRangeCategory } from './core.js';
import {
  GraphemeCategory,
  grapheme_cats,
  grapheme_data,
  grapheme_pairs,
} from './_grapheme_data.js';

/**
 * @typedef {import('./_grapheme_data.js').GC_Any} GC_Any
 *
 * @typedef {import('./_grapheme_data.js').GraphemeCategoryNum} GraphemeCategoryNum
 *
 * @typedef {object} GraphemeSegmentExtra
 * @property {number} _hd The first code point of the segment
 * @property {GraphemeCategoryNum} _catBegin Beginning Grapheme_Cluster_Break category of the segment
 * @property {GraphemeCategoryNum} _catEnd Ending Grapheme_Cluster_Break category of the segment
 *
 * @typedef {import('./core.js').SegmentOutput<GraphemeSegmentExtra>} GraphemeSegmentOutput
 * @typedef {import('./core.js').Segmenter<GraphemeSegmentExtra>} GraphemeSegmenter
 */

export { GraphemeCategory };

// Every bound below is spelled out as a literal on purpose.
//
// A shared module-scope binding saves a few bundled bytes, but it is a mutable context slot
// that engines cannot fold into the comparison; hoisting the hottest one into a `let` measured up to 25% slower on the count loop.

// Direct category lookup tables for the hot Unicode regions, and a flat binary-search tail for everything rare.
//
// - T0: 0x0000-0x309F (ASCII, Latin, Greek, Cyrillic, Semitic, Indic, SEA, CJK punctuation and kana;
//   the table ends right after the last combining kana mark so that the CJK blocks need no lookup at all)
// - 0x30A0-0xA65F (CJK, Yi, Lisu, Vai): only U+3297 and U+3299 are not `Any`
// - T1: 0xA660-0xABFF
// - 0xAC00-0xD7A3 (Hangul syllables): LV or LVT computed at runtime
// - T2: 0x1F000-0x1FAFF (emoji)
// - 0xFE00-0xFE0F (variation selectors): computed inline
// - 0xD7A4-0xFDFF (Jamo Ext-B, surrogates, private use): {@link catRare}
// - 0xE0000-0xE0FFF (tags, VS supplement): {@link catRare}
// - everything else: binary search over the range tail (TAIL_S/TAIL_E)
//
// The `Indic_Conjunct_Break=Consonant` property is folded into the category
// space as the 16th category (15) since it never overlaps other categories.
// It shares break semantics with `Any` and never escapes to the public API.
//
// Total index size: ~19KiB of flat typed arrays, no retained JS objects.
const T0 = new Uint8Array(0x30A0);
const T1 = new Uint8Array(0x5A0);
const T2 = new Uint8Array(0xB00);
/** @type {Uint32Array} Range starts of the binary-search tail */
let TAIL_S;
/** @type {Uint32Array} Packed `end << 5 | category`, parallel to {@link TAIL_S} */
let TAIL_E;
{
  let fill = (
    /** @type {Uint8Array} */ t,
    /** @type {number} */ lo,
    /** @type {number} */ from,
    /** @type {number} */ to,
    /** @type {number} */ cat,
  ) => {
    let end = to - lo + 1, len = t.length;
    if (end > 0 && from - lo < len) {
      t.fill(cat, from > lo ? from - lo : 0, end > len ? len : end);
    }
  };
  let starts = new Uint32Array(320), ends = new Uint32Array(320), n = 0;
  decodeUnicodeData(grapheme_data, grapheme_cats, (from, to, cat) => {
    fill(T0, 0, from, to, cat);
    fill(T1, 0xA660, from, to, cat);
    fill(T2, 0x1F000, from, to, cat);
    if (to >= 0xFE10 && !(from >= 0x1F000 && to <= 0x1FAFF)) {
      starts[n] = from;
      ends[n++] = to << 5 | cat;
    }
  });
  TAIL_S = starts.slice(0, n);
  TAIL_E = ends.slice(0, n);
}

/**
 * `Grapheme_Cluster_Break` property value of a given codepoint
 *
 * @see https://www.unicode.org/reports/tr29/tr29-45.html#Default_Grapheme_Cluster_Table
 *
 * @param {number} cp
 * @return {number} category number, {@link GraphemeCategoryNum} or 15 (`InCB=Consonant`)
 */
function cat(cp) {
  if (cp < 0x30A0) return T0[cp];
  // CJK through Vai: U+3297 and U+3299 are the only two that are not `Any`
  if (cp < 0xA660) return cp === 0x3297 || cp === 0x3299 ? 4 : 0;
  if (cp < 0xAC00) return T1[cp - 0xA660];
  // Hangul syllables: 0xAC00-0xD7A3, LV at every 28th
  if (cp < 0xD7A4) return (cp - 0xAC00) % 28 ? 8 : 7;
  // Emoji: 0x1F000-0x1FAFF
  if (cp >= 0x1F000 && cp < 0x1FB00) return T2[cp - 0x1F000];
  // Variation selectors: 0xFE00-0xFE0F
  if (cp >>> 4 === 0xFE0) return 3;
  return catRare(cp);
}

/**
 * Cold half of {@link cat}.
 * Kept out of line so that the hot half stays well inside V8's 460-bytecode inlining limit.
 *
 * As a single function the ladder compiled to 453 bytecodes,
 * one comparison away from a cliff that cost 15-45% on every segmentation loop once `cat` stopped being inlined.
 *
 * @param {number} cp in 0xD7A4-0xDFFF, 0xE000-0xFDFF, 0xFE10-0x1EFFF or 0x1FB00+
 * @return {number} category number
 */
function catRare(cp) {
  // Hangul Jamo Extended-B, unassigned and surrogates as Any
  if (cp < 0xE000) {
    if (cp <= 0xD7C6) return cp >= 0xD7B0 ? 13 : 0;
    return (cp >= 0xD7CB && cp <= 0xD7FB) ? 12 : 0;
  }
  // Private use
  if (cp < 0xFE00) return cp === 0xFB1E ? 3 : 0;
  // Tags and variation selectors supplement: 0xE0000-0xE0FFF
  if (cp >= 0xE0000) {
    if (cp > 0xE0FFF) return 0;
    return ((cp >= 0xE0020 && cp < 0xE0080) || (cp >= 0xE0100 && cp < 0xE01F0)) ? 3 : 2;
  }
  // The rare tail: 0xFE10-0xFFFF, 0x10000-0x1EFFF, 0x1FB00-0xDFFFF
  return findUnicodeRangeCategory(cp, TAIL_S, TAIL_E);
}

// Boundary mask table for category pairs, `PAIR[catBefore << 4 | catAfter]`.
//
// A boundary exists iff the mask shares no bit with the packed sequence state,
// so the whole decision is `!(st & PAIR[...])`:
//
// - 0: boundary (GB999 and friends), no state bit can match
// - 1: no boundary; bit 0 is always set in the state
// - 2: GB12/GB13, no boundary iff odd run of RI precedes
// - 4: GB11, no boundary iff the ZWJ was preceded by ExtPic Extend*
// - 8: GB9c, no boundary iff InCB Consonant [Extend Linker]* Linker [Extend Linker]* precedes
const PAIR = Uint8Array.from(grapheme_pairs);

/**
 * The Unicode `Indic_Conjunct_Break=Linker` set
 *
 * @param {number} cp
 * @return {boolean}
 */
function isLinker(cp) {
  return cp === 0x094D  // Devanagari Sign Virama
    || cp === 0x09CD    // Bengali Sign Virama
    || cp === 0x0A4D    // Gurmukhi Sign Virama
    || cp === 0x0ACD    // Gujarati Sign Virama
    || cp === 0x0B4D    // Oriya Sign Virama
    || cp === 0x0C4D    // Telugu Sign Virama
    || cp === 0x0D4D    // Malayalam Sign Virama
    || cp === 0x1039    // Myanmar Sign Virama
    || cp === 0x17D2    // Khmer Sign Coeng
    || cp === 0x1A60    // Tai Tham Sign Sakot
    || cp === 0x1B44    // Balinese Adeg Adeg
    || cp === 0x1BAB    // Sundanese Sign Virama
    || cp === 0xA9C0    // Javanese Pangkon
    || cp === 0xAAF6    // Meetei Mayek Virama
    || cp === 0x10A3F   // Kharoshthi Virama
    || cp === 0x11133   // Chakma Virama
    || cp === 0x113D0   // Tulu-Tigalari Conjoiner
    || cp === 0x1193E   // Dives Akuru Virama
    || cp === 0x11A47   // Zanabazar Square Subjoiner
    || cp === 0x11A99   // Soyombo Subjoiner
    || cp === 0x11F42;  // Kawi Conjoiner
}

// Sequence state, packed in a small int. The bits a boundary rule can ask
// about are laid out so that each {@link PAIR} mask selects exactly one:
//
//   bit 0 (1)  : always set, so the no-boundary mask always matches
//   bit 1 (2)  : odd run of Regional_Indicator immediately precedes (GB12, GB13)
//   bit 2 (4)  : the last consumed ZWJ was preceded by ExtPic Extend* (GB11)
//   bit 3 (8)  : the InCB Consonant run contains a Linker (GB9c)
//   bit 4 (16) : ExtPic Extend* immediately precedes (feeds bit 2 on ZWJ)
//   bit 5 (32) : InCB Consonant [Extend Linker]* precedes
//
// It is a pure function of the consumed code point sequence,
// so it carries across segment boundaries without any reset.
// Non-stateful categories reset the state to 1 inside {@link nextState}.

/**
 * State transition on consuming an Extend code point (category 3) that continues an InCB Consonant run.
 * The cp-dependent ZWNJ / `isLinker` branches are extracted here so that {@link nextState} stays small enough to inline.
 *
 * @param {number} st packed state
 * @param {number} cp the consumed Extend code point
 * @return {number} next packed state
 */
function nextExtend(st, cp) {
  if (cp === 0x200C) return st & 21;  // ZWNJ has InCB=None
  if (st & 8 || isLinker(cp)) return st & 21 | 40;
  return st & 21 | 32;
}

/**
 * State transition on consuming a code point.
 *
 * Extend (cat 3) is cp-dependent within an InCB Consonant run and delegates to {@link nextExtend};
 * the remaining stateful categories (4, 10, 14, 15) are inline; everything else resets to 1.
 *
 * @remarks
 * > Keep this body at or below 99 bytecodes (`node --print-bytecode -print-bytecode-filter=nextState`):
 * > Maglev refuses to inline anything from 100 bytecodes up, and the resulting call per code point measured 8-26% slower there.
 * > That is also why the tests are an `if` chain rather than a `switch`, which spends 3 extra bytecodes on the discriminant.
 *
 * @param {number} st packed state
 * @param {number} c category of the consumed code point
 * @param {number} cp the consumed code point
 * @return {number} next packed state
 */
function nextState(st, c, cp) {
  if (c === 3) return st & 32 ? nextExtend(st, cp) : st & 21;
  if (c === 4) return 17;                     // Extended_Pictographic
  if (c === 10) return (st & 2) ^ 3;          // Regional_Indicator
  if (c === 14) return (st & 16) >> 2 | st & 41;  // ZWJ
  if (c === 15) return 33;                    // InCB=Consonant
  return 1;
}

/**
 * Unicode segmentation by extended grapheme rules.
 *
 * This is fully compatible with the {@link Intl.Segmenter.segment} API
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter/segment
 *
 * @param {string} input
 * @return {GraphemeSegmenter} iterator for grapheme cluster segments
 */
export function* graphemeSegments(input) {
  let len = input.length;
  if (len === 0) return;

  let cp = /** @type {number} */ (input.codePointAt(0));
  let cursor = cp > 0xFFFF ? 2 : 1;

  /** Category of the last consumed code point */
  let catBefore = cat(cp);

  /** Packed sequence state, seeded with the always-set bit 0 */
  let st = nextState(1, catBefore, cp);

  /** Start index of the current segment */
  let index = 0;

  /** Head code point of the current segment */
  let hd = cp;

  /** Category of the head */
  let catBegin = catBefore;

  while (cursor < len) {
    cp = /** @type {number} */ (input.codePointAt(cursor));
    let catAfter = cat(cp);
    let boundary = !(st & PAIR[catBefore << 4 | catAfter]);

    st = nextState(st, catAfter, cp);

    if (boundary) {
      yield {
        segment: input.slice(index, cursor),
        index,
        input,
        _hd: hd,
        _catBegin: /** @type {GraphemeCategoryNum} */ (catBegin === 15 ? 0 : catBegin),
        _catEnd: /** @type {GraphemeCategoryNum} */ (catBefore === 15 ? 0 : catBefore),
      };
      index = cursor;
      hd = cp;
      catBegin = catAfter;
    }
    cursor += cp > 0xFFFF ? 2 : 1;
    catBefore = catAfter;
  }

  yield {
    segment: input.slice(index),
    index,
    input,
    _hd: hd,
    _catBegin: /** @type {GraphemeCategoryNum} */ (catBegin === 15 ? 0 : catBegin),
    _catEnd: /** @type {GraphemeCategoryNum} */ (catBefore === 15 ? 0 : catBefore),
  };
}

/**
 * Count number of extended grapheme clusters in given text.
 *
 * @param {string} input
 * @return {number} count of grapheme clusters
 */
export function countGraphemes(input) {
  let len = input.length;
  if (len === 0) return 0;

  let cp = /** @type {number} */ (input.codePointAt(0));
  let cursor = cp > 0xFFFF ? 2 : 1;

  /** Category of the last consumed code point */
  let catBefore = cat(cp);

  /** Packed sequence state, seeded with the always-set bit 0 */
  let st = nextState(1, catBefore, cp);

  /** The segment being scanned counts, whether or not a boundary follows */
  let count = 1;

  while (cursor < len) {
    cp = /** @type {number} */ (input.codePointAt(cursor));
    let catAfter = cat(cp);
    let boundary = !(st & PAIR[catBefore << 4 | catAfter]);

    st = nextState(st, catAfter, cp);

    // NOTE: While TurboFan opts well coercion here, so the branchless form may faster here
    // ```
    // count += +!(st & PAIR[catBefore << 4 | catAfter]);
    // ```
    // However, Maglev doesn't.
    // A segmenter called a few hundred times per interaction lives there.
    if (boundary) count += 1;

    cursor += cp > 0xFFFF ? 2 : 1;
    catBefore = catAfter;
  }

  return count;
}

export {
  /**
   * @deprecated use {@link countGraphemes}
   */
  countGraphemes as countGrapheme,
};

/**
 * Split given text into extended grapheme clusters.
 *
 * @param {string} input
 * @return {IterableIterator<string>} iterator for grapheme clusters
 *
 * @see {@link graphemeSegments} if you need extra information.
 *
 * @example
 * [...splitGraphemes('abc')] // => ['a', 'b', 'c']
 */
export function* splitGraphemes(input) {
  let len = input.length;
  if (len === 0) return;

  let cp = /** @type {number} */ (input.codePointAt(0));
  let cursor = cp > 0xFFFF ? 2 : 1;

  /** Category of the last consumed code point */
  let catBefore = cat(cp);

  /** Packed sequence state, seeded with the always-set bit 0 */
  let st = nextState(1, catBefore, cp);

  /** Start index of the current segment */
  let index = 0;

  while (cursor < len) {
    cp = /** @type {number} */ (input.codePointAt(cursor));
    let catAfter = cat(cp);
    let boundary = !(st & PAIR[catBefore << 4 | catAfter]);

    st = nextState(st, catAfter, cp);

    if (boundary) {
      yield input.slice(index, cursor);
      index = cursor;
    }
    cursor += cp > 0xFFFF ? 2 : 1;
    catBefore = catAfter;
  }

  yield input.slice(index);
}

/**
 * Collect all extended grapheme clusters in given text.
 *
 * This is a faster alternative to {@link splitGraphemes}, as it packs sliced segments directly into the result array.
 * However, for large inputs, using the {@link splitGraphemes} is more memory-efficient.
 *
 * @param {string} input
 * @return {string[]} array of grapheme clusters
 *
 * @see {@link splitGraphemes} for a large text input.
 *
 * @example
 * collectGraphemes('abc') // => ['a', 'b', 'c']
 */
export function collectGraphemes(input) {
  /** @type {string[]} */
  let result = [];

  let len = input.length;
  if (len === 0) return result;

  let cp = /** @type {number} */ (input.codePointAt(0));
  let cursor = cp > 0xFFFF ? 2 : 1;

  /** Category of the last consumed code point */
  let catBefore = cat(cp);

  /** Packed sequence state, seeded with the always-set bit 0 */
  let st = nextState(1, catBefore, cp);

  /** Start index of the current segment */
  let index = 0;

  while (cursor < len) {
    cp = /** @type {number} */ (input.codePointAt(cursor));
    let catAfter = cat(cp);
    let boundary = !(st & PAIR[catBefore << 4 | catAfter]);

    st = nextState(st, catAfter, cp);

    if (boundary) {
      result.push(input.slice(index, cursor));
      index = cursor;
    }
    cursor += cp > 0xFFFF ? 2 : 1;
    catBefore = catAfter;
  }

  result.push(input.slice(index));
  return result;
}
