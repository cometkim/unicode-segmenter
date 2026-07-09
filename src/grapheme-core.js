// @ts-check

// Shared machinery for the grapheme segmentation entries
// (`grapheme.js` and `grapheme-counter.js`).
//
// This module is internal; it is not listed in the package exports map
// and its exports are not part of the public API.

import { decodeUnicodeData, findUnicodeRangeCategory } from './core.js';
import { grapheme_data, grapheme_cats, grapheme_pairs } from './_grapheme_data.js';

/**
 * @typedef {import('./_grapheme_data.js').GraphemeCategoryNum} GraphemeCategoryNum
 */

// Repeated bounds are `let` bindings on purpose; minifiers inline
// `const` numbers into every use site, but keep `let` shared.
export let BMP_MAX = 0xFFFF;
let T1_MIN = 0xA000;
let T2_MIN = 0x1F000;

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
    let hi = lo + t.length - 1;
    for (let cp = from < lo ? lo : from, top = to > hi ? hi : to; cp <= top; cp++) {
      t[cp - lo] = cat;
    }
  };
  let starts = new Uint32Array(320), ends = new Uint32Array(320), n = 0;
  for (let [from, to, cat] of decodeUnicodeData(grapheme_data, grapheme_cats)) {
    fill(T0, 0, from, to, cat);
    fill(T1, T1_MIN, from, to, cat);
    fill(T2, T2_MIN, from, to, cat);
    if (to >= 0xFE10 && !(from >= T2_MIN && to <= 0x1FAFF)) {
      starts[n] = from;
      ends[n++] = to << 5 | cat;
    }
  }
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
export function cat(cp) {
  if (cp < 0x3000) return T0[cp];
  // CJK: 0x3000-0x9FFF
  if (cp < T1_MIN) {
    if (cp < 0x3030) return cp >= 0x302A ? 3 : 0;
    if (cp < 0x309B) {
      if (cp === 0x3030 || cp === 0x303D) return 4;
      return cp >= 0x3099 ? 3 : 0;
    }
    return (cp === 0x3297 || cp === 0x3299) ? 4 : 0;
  }
  if (cp < 0xAC00) return T1[cp - T1_MIN];
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
  if (cp >= T2_MIN && cp < 0x1FB00) return T2[cp - T2_MIN];
  // Tags and variation selectors supplement: 0xE0000-0xE0FFF
  if (cp >= 0xE0000) {
    if (cp > 0xE0FFF) return 0;
    return ((cp >= 0xE0020 && cp < 0xE0080) || (cp >= 0xE0100 && cp < 0xE01F0)) ? 3 : 2;
  }
  // The rare tail: 0xFE10-0xFFFF, 0x10000-0x1EFFF, 0x1FB00-0xDFFFF
  return findUnicodeRangeCategory(cp, TAIL_S, TAIL_E);
}

// Boundary decision table for category pairs, `PAIR[catBefore << 4 | catAfter]`
//
// - 0: boundary (GB999 and friends)
// - 1: no boundary
// - 2: GB12/GB13, no boundary iff odd run of RI precedes
// - 3: GB11, no boundary iff the ZWJ was preceded by ExtPic Extend*
// - 4: GB9c, no boundary iff InCB Consonant [Extend Linker]* Linker [Extend Linker]* precedes
export const PAIR = Uint8Array.from(grapheme_pairs, Number);

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
export function nextState(st, c, cp) {
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
