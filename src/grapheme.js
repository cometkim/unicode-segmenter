// @ts-check

import { decodeUnicodeData } from './core.js';
import { GraphemeCategory, grapheme_data, grapheme_cats, grapheme_pairs } from './_grapheme_data.js';

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

// Direct category lookup tables for the hot Unicode regions, and a flat
// binary-search tail for everything rare.
//
// - T0: 0x0000-0x2FFF (ASCII, Latin, Greek, Cyrillic, Semitic, Indic, SEA, ...)
// - 0x3000-0x9FFF (CJK): only 12 non-Any code points, computed inline
// - T1: 0xA000-0xABFF
// - 0xAC00-0xD7A3 (Hangul syllables): LV or LVT computed at runtime
// - 0xD7A4-0xFDFF (Jamo Ext-B, surrogates, private use): computed inline
// - 0xFE00-0xFE0F (variation selectors): computed inline
// - T2: 0x1F000-0x1FAFF (emoji)
// - 0xE0000-0xE0FFF (tags, VS supplement): computed inline
// - everything else: binary search over the range tail (TAIL_S/TAIL_E)
//
// The `Indic_Conjunct_Break=Consonant` property is folded into the category
// space as the 16th category (15) since it never overlaps other categories.
// It shares break semantics with `Any` and never escapes to the public API.
//
// Total index size: ~21KiB of flat typed arrays, no retained JS objects.
const T0 = new Uint8Array(0x3000);
const T1 = new Uint8Array(0xC00);
const T2 = new Uint8Array(0xB00);
const TAIL_S = new Uint32Array(320);
const TAIL_E = new Uint32Array(320);
let TAIL_N = 0;
{
  let fill = (
    /** @type {Uint8Array} */ t,
    /** @type {number} */ lo,
    /** @type {number} */ hi,
    /** @type {number} */ from,
    /** @type {number} */ to,
    /** @type {number} */ cat,
  ) => {
    for (let cp = from < lo ? lo : from, top = to > hi ? hi : to; cp <= top; cp++) {
      t[cp - lo] = cat;
    }
  };
  for (let [from, to, cat] of decodeUnicodeData(grapheme_data, grapheme_cats)) {
    fill(T0, 0, 0x2FFF, from, to, cat);
    fill(T1, 0xA000, 0xABFF, from, to, cat);
    fill(T2, 0x1F000, 0x1FAFF, from, to, cat);
    if (to >= 0xFE10 && !(from >= 0x1F000 && to <= 0x1FAFF)) {
      TAIL_S[TAIL_N] = from;
      TAIL_E[TAIL_N++] = to << 4 | cat;
    }
  }
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
  if (cp < 0x3000) return T0[cp];
  // CJK: 0x3000-0x9FFF
  if (cp < 0xA000) {
    if (cp < 0x3030) return cp >= 0x302A ? 3 : 0;
    if (cp < 0x309B) {
      if (cp === 0x3030 || cp === 0x303D) return 4;
      return cp >= 0x3099 ? 3 : 0;
    }
    return (cp === 0x3297 || cp === 0x3299) ? 4 : 0;
  }
  if (cp < 0xAC00) return T1[cp - 0xA000];
  // Hangul syllables: 0xAC00-0xD7A3, LV at every 28th
  if (cp < 0xD7A4) return (cp - 0xAC00) % 28 ? 8 : 7;
  // Hangul Jamo Extended-B, unassigned and surrogates as Any
  if (cp < 0xE000) {
    if (cp <= 0xD7C6) return cp >= 0xD7B0 ? 13 : 0;
    return (cp >= 0xD7CB && cp <= 0xD7FB) ? 12 : 0;
  }
  // Private use
  if (cp < 0xFE00) return cp === 0xFB1E ? 3 : 0;
  // Variation selectors
  if (cp < 0xFE10) return 3;
  // Emoji: 0x1F000-0x1FAFF
  if (cp >= 0x1F000 && cp < 0x1FB00) return T2[cp - 0x1F000];
  // Tags and variation selectors supplement: 0xE0000-0xE0FFF
  if (cp >= 0xE0000) {
    if (cp > 0xE0FFF) return 0;
    return ((cp >= 0xE0020 && cp < 0xE0080) || (cp >= 0xE0100 && cp < 0xE01F0)) ? 3 : 2;
  }
  // The rare tail: 0xFE10-0xFFFF, 0x10000-0x1EFFF, 0x1FB00-0xDFFFF
  let lo = 0, hi = TAIL_N - 1;
  while (lo <= hi) {
    let mid = (lo + hi) >> 1;
    let e = TAIL_E[mid];
    if (cp < TAIL_S[mid]) hi = mid - 1;
    else if (cp > e >>> 4) lo = mid + 1;
    else return e & 15;
  }
  return 0;
}

// Boundary decision table for category pairs, `PAIR[catBefore << 4 | catAfter]`
//
// - 0: boundary (GB999 and friends)
// - 1: no boundary
// - 2: GB12/GB13, no boundary iff odd run of RI precedes
// - 3: GB11, no boundary iff the ZWJ was preceded by ExtPic Extend*
// - 4: GB9c, no boundary iff InCB Consonant [Extend Linker]* Linker [Extend Linker]* precedes
const PAIR = Uint8Array.from(grapheme_pairs, Number);

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

// Sequence state, packed in a small int:
//
//   bit 0   : odd run of Regional_Indicator immediately precedes (GB12, GB13)
//   bit 1   : ExtPic Extend* immediately precedes (GB11)
//   bit 2   : the last consumed ZWJ was preceded by ExtPic Extend* (GB11)
//   bit 3-4 : InCB state; 01 = Consonant [Extend Linker]* precedes,
//             10 = it also contains a Linker (GB9c)
//
// It is a pure function of the consumed code point sequence, so it carries
// across segment boundaries without any reset. Callers skip the transition
// (resetting state to 0) unless the category can arm or keep state;
// see the `0xC418` masks (categories 3, 4, 10, 14, and 15) on call sites.

/**
 * State transition on consuming a code point.
 *
 * @param {number} st packed state
 * @param {number} c category of the consumed code point
 * @param {number} cp the consumed code point
 * @return {number} next packed state
 */
function nextState(st, c, cp) {
  switch (c) {
    // Extend; keeps picto bits, advances InCB run
    case 3:
      if (st & 24) {
        if (cp === 0x200C) return st & 6;  // ZWNJ has InCB=None
        if ((st & 24) === 16 || isLinker(cp)) return (st & 6) | 16;
        return (st & 6) | 8;
      }
      return st & 6;
    // Extended_Pictographic
    case 4:
      return 2;
    // Regional_Indicator; toggles parity
    case 10:
      return (st & 1) ^ 1;
    // ZWJ; captures the picto bit, advances InCB run
    case 14:
      return (st & 2) << 1 | (st & 24);
    // InCB=Consonant (15); callers never pass other categories
    default:
      return 8;
  }
}

/**
 * @implements {Iterator<GraphemeSegmentOutput, undefined>}
 */
class GraphemeSegmentIterator {
  /**
   * @param {string} input
   */
  constructor(input) {
    let len = input.length;
    let cp = 0, c = 0, st = 0, cursor = 0;
    if (len) {
      cp = input.charCodeAt(0);
      cursor = 1;
      if ((cp & 0xFC00) === 0xD800 && len > 1) {
        let trail = input.charCodeAt(1);
        if ((trail & 0xFC00) === 0xDC00) {
          cp = (cp << 10) + trail - 0x35FDC00;
          cursor = 2;
        }
      }
      c = cat(cp);
      if ((0xC418 >> c) & 1) st = nextState(0, c, cp);
    }
    /** @type {string} */
    this._str = input;
    /** @type {boolean} */
    this._done = len === 0;
    /** @type {number} Cursor position right after the last consumed code point */
    this._cursor = cursor;
    /** @type {number} Category of the last consumed code point */
    this._catBefore = c;
    /** @type {number} Start index of the next segment */
    this._index = 0;
    /** @type {number} Head code point of the next segment */
    this._hd = cp;
    /** @type {number} Category of the head */
    this._catBegin = c;
    /** @type {number} Packed sequence state */
    this._st = st;
  }

  [Symbol.iterator]() {
    return this;
  }

  /**
   * @return {IteratorResult<GraphemeSegmentOutput, undefined>}
   */
  next() {
    if (this._done) return { value: undefined, done: true };
    let input = this._str,
      len = input.length,
      cursor = this._cursor,
      catBefore = this._catBefore,
      st = this._st;

    while (cursor < len) {
      let cp = input.charCodeAt(cursor), wide = 1;
      if ((cp & 0xFC00) === 0xD800 && cursor + 1 < len) {
        let trail = input.charCodeAt(cursor + 1);
        if ((trail & 0xFC00) === 0xDC00) {
          cp = (cp << 10) + trail - 0x35FDC00;
          wide = 2;
        }
      }
      let catAfter = cat(cp);
      let d = PAIR[catBefore << 4 | catAfter];
      let boundary;
      if (d === 0) boundary = true;
      else if (d === 1) boundary = false;
      else if (d === 2) boundary = !(st & 1);
      else if (d === 3) boundary = !(st & 4);
      else boundary = (st & 24) !== 16;

      st = (0xC418 >> catAfter) & 1 && (st !== 0 || catAfter !== 3)
        ? nextState(st, catAfter, cp)
        : 0;

      if (boundary) {
        let index = this._index, catBegin = this._catBegin;
        let value = {
          segment: input.slice(index, cursor),
          index,
          input,
          _hd: this._hd,
          _catBegin: /** @type {GraphemeCategoryNum} */ (catBegin === 15 ? 0 : catBegin),
          _catEnd: /** @type {GraphemeCategoryNum} */ (catBefore === 15 ? 0 : catBefore),
        };
        this._cursor = cursor + wide;
        this._catBefore = catAfter;
        this._index = cursor;
        this._hd = cp;
        this._catBegin = catAfter;
        this._st = st;
        return { value, done: false };
      }
      cursor += wide;
      catBefore = catAfter;
    }

    this._done = true;
    let index = this._index, catBegin = this._catBegin;
    return {
      value: {
        segment: input.slice(index),
        index,
        input,
        _hd: this._hd,
        _catBegin: /** @type {GraphemeCategoryNum} */ (catBegin === 15 ? 0 : catBegin),
        _catEnd: /** @type {GraphemeCategoryNum} */ (catBefore === 15 ? 0 : catBefore),
      },
      done: false,
    };
  }
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
export function graphemeSegments(input) {
  return /** @type {GraphemeSegmenter} */ (new GraphemeSegmentIterator(input));
}

/**
 * Count number of extended grapheme clusters in given text.
 *
 * NOTE:
 *
 * This function is a small wrapper around {@link graphemeSegments}.
 *
 * If you call it more than once at a time, consider memoization
 * or use {@link graphemeSegments} or {@link splitGraphemes} once instead
 *
 * @param {string} text
 * @return {number} count of grapheme clusters
 */
export function countGraphemes(text) {
  let count = 0;
  for (let _ of new GraphemeSegmentIterator(text)) count += 1;
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
 * @param {string} text
 * @return {IterableIterator<string>} iterator for grapheme clusters
 *
 * @see {@link graphemeSegments} if you need extra information.
 *
 * @example
 * [...splitGraphemes('abc')] // => ['a', 'b', 'c']
 */
export function* splitGraphemes(text) {
  for (let s of new GraphemeSegmentIterator(text)) yield s.segment;
}

// Keep one live segmenter and its result reachable so their hidden classes
// stay strongly referenced. Otherwise a major GC while no segmenter is
// alive clears the maps embedded weakly in JIT-optimized code, and the
// next run pays deoptimization and re-learning costs.
//
// The instances are stashed on an always-retained module object, since
// unreferenced module-scope bindings do not survive module evaluation.
{
  let keep = new GraphemeSegmentIterator('_');
  // @ts-ignore intended expando
  PAIR._keep = [keep, keep.next()];
}
