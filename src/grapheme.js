// Copyright 2012-2018 The Rust Project Developers. See the COPYRIGHT
// file at the top-level directory of this distribution and at
// http://rust-lang.org/COPYRIGHT.
//
// Licensed under the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>.
//
// Modified original Rust library [source code]
// (https://github.com/unicode-rs/unicode-segmentation/blob/1f88570/src/grapheme.rs)
//
// to create JavaScript library [unicode-segmenter]
// (https://github.com/cometkim/unicode-segmenter)

// @ts-check

import { findUnicodeRangeIndex } from './core.js';
import { GraphemeCategory, grapheme_ranges } from './_grapheme_data.js';
import { consonant_ranges } from './_incb_data.js';

/**
 * @typedef {import('./_grapheme_data.js').GC_Any} GC_Any
 *
 * @typedef {import('./_grapheme_data.js').GraphemeCategoryNum} GraphemeCategoryNum
 * @typedef {import('./_grapheme_data.js').GraphemeCategoryRange} GraphemeCategoryRange
 *
 * @typedef {object} GraphemeSegmentExtra
 * @property {number} _hd The first code point of the segment
 * @property {GraphemeCategoryNum} _catBegin Beginning Grapheme_Cluster_Break category of the segment
 * @property {GraphemeCategoryNum} _catEnd Ending Grapheme_Cluster_Break category of the segment
 *
 * @typedef {import('./core.js').Segmenter<GraphemeSegmentExtra>} GraphemeSegmenter
 */

export { GraphemeCategory };

const BMP_MAX = 0xFFFF;

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
  let cp = input.codePointAt(0);

  // do nothing on empty string
  if (cp == null) return;

  /** Current cursor position. */
  let cursor = cp <= BMP_MAX ? 1 : 2;

  /** Total length of the input string. */
  let len = input.length;

  /** Category of codepoint immediately preceding cursor */
  let catBefore = cat(cp);

  /** @type {GraphemeCategoryNum} Category of codepoint immediately preceding cursor. */
  let catAfter = 0;

  /** The number of RIS codepoints preceding `cursor`. */
  let risCount = 0;

  /**
   * Emoji state for GB11: tracks if we've seen Extended_Pictographic followed by Extend* ZWJ
   * Only relevant when catBefore === ZWJ && catAfter === Extended_Pictographic
   */
  let emoji = false;

  /** InCB=Consonant - segment started with Indic consonant */
  let consonant = false;

  /** InCB=Linker - seen a linker after consonant */
  let linker = false;

  let index = 0;

  /** Beginning category of a segment */
  let _catBegin = catBefore;

  /** Memoize the beginning code point of the segment. */
  let _hd = cp;

  while (cursor < len) {
    cp = /** @type {number} */ (input.codePointAt(cursor));
    catAfter = cat(cp);

    let boundary = true;

    // GB3: CR × LF
    if (catBefore === 1) {
      boundary = catAfter !== 6;
    }
    // GB4: (Control | CR | LF) ÷
    else if (catBefore === 2 || catBefore === 6) {
      boundary = true;
    }
    // GB5: ÷ (Control | CR | LF)
    else if (catAfter === 1 || catAfter === 2 || catAfter === 6) {
      boundary = true;
    }
    // GB9, GB9a: × (Extend | ZWJ | SpacingMark) - most common no-break case
    else if (catAfter === 3 || catAfter === 14 || catAfter === 11) {
      boundary = false;
    }
    // GB9b: Prepend ×
    else if (catBefore === 9) {
      boundary = false;
    }
    // GB11: ExtPic Extend* ZWJ × ExtPic
    else if (catBefore === 14 && catAfter === 4) {
      boundary = !emoji;
    }
    // GB12, GB13: RI × RI (odd count means no break)
    else if (catBefore === 10 && catAfter === 10) {
      // risCount is count BEFORE current RI, so odd means this is 2nd, 4th, etc.
      boundary = risCount++ % 2 === 1;
    }
    // GB6: L × (L | V | LV | LVT)
    else if (catBefore === 5) {
      boundary = !(catAfter === 5 || catAfter === 13 || catAfter === 7 || catAfter === 8);
    }
    // GB7: (LV | V) × (V | T)
    else if ((catBefore === 7 || catBefore === 13) && (catAfter === 13 || catAfter === 12)) {
      boundary = false;
    }
    // GB8: (LVT | T) × T
    else if ((catBefore === 8 || catBefore === 12) && catAfter === 12) {
      boundary = false;
    }
    // GB9c: InCB=Consonant InCB=Extend* InCB=Linker InCB=Extend* × InCB=Consonant
    else if (catAfter === 0 && consonant && linker && isIndicConjunctConsonant(cp)) {
      boundary = false;
    }
    // else GB999: ÷ Any

    if (boundary) {
      yield {
        segment: input.slice(index, cursor),
        index,
        input,
        _hd,
        _catBegin,
        _catEnd: catBefore,
      };

      // Reset segment state
      emoji = false;
      risCount = 0;
      index = cursor;
      _catBegin = catAfter;
      _hd = cp;
    } 
    // Update state for continuing segment
    else {
      // emoji state for GB11
      if (catAfter === 14 && (catBefore === 3 || catBefore === 4)) {
        emoji = true;
      }
      // InCB state for GB9c
      else if (cp >= 2325) {
        if (!consonant && catBefore === 0) {
          consonant = isIndicConjunctConsonant(_hd);
        }
        if (consonant && catAfter === 3) {
          linker = linker
            || cp === 0x094D
            || cp === 0x09CD
            || cp === 0x0A4D
            || cp === 0x0ACD
            || cp === 0x0B4D
            || cp === 0x0C4D
            || cp === 0x0D4D;
        } else {
          linker = false;
        }
      }
    }

    cursor += cp <= BMP_MAX ? 1 : 2;
    catBefore = catAfter;
  }

  if (index < len) {
    yield {
      segment: input.slice(index),
      index,
      input,
      _hd,
      _catBegin,
      _catEnd: catBefore,
    };
  }
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
  for (let _ of graphemeSegments(text)) count += 1;
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
  for (let s of graphemeSegments(text)) yield s.segment;
}

// Segmented 4-bit packed lookup tables for BMP code points.
// 
// Memory and code size optimization: Skip regions that can be easily inlined
// - 0x3000-0x9FFF (CJK): 28,672 codepoints, only 12 non-Any ranges
// - 0xAC00-0xD7A3 (Hangul syllables): 11,172 codepoints, LV or LVT computed at runtime
// - 0xD7A4-0xD7FF (Hangul Jamo Extended-B): 92 codepoints, only 2 non-Any ranges
// - 0xE000-0xFDFF (Private Use): 7,680 codepoints, only 1 non-Any range
// - 0xFE00-0xFFFF (Specials): 512 codepoints -> very rare and small, binary search fallback
// 
// Hangul syllables note:
// - LV syllables: single codepoints at 0xAC00 + n*28
// - LVT syllables: 27 consecutive codepoints after each LV
// 
// Indexed category segments (4-bit packed, 2 categories per byte):
// - SEG0: 0x0080-0x2FFF (12,160 codepoints -> 6,080 bytes)
// - SEG1: 0xA000-0xABFF (3,072 codepoints -> 1,536 bytes)
//
// Total index size: 7,616 bytes (~7.4KB)
const SEG0 = new Uint8Array(6080), SEG0_MIN = 0x0080, SEG0_MAX = 0x2FFF;
const SEG1 = new Uint8Array(1536), SEG1_MIN = 0xA000, SEG1_MAX = 0xABFF;
const SEG_CURSOR = (() => {
  let cursor = 0;
  while (true) {
    let [start, end, cat] = grapheme_ranges[cursor];
    if (start > SEG1_MAX) break;
    cursor++;

    // Skip inlined ranges
    if (end < SEG0_MIN || (start > SEG0_MAX && end < SEG1_MIN)) continue;

    for (let cp = start; cp <= end; cp++) {
      let /** @type {Uint8Array} */ seg, idx = 0;

      if (cp <= SEG0_MAX) {
        seg = SEG0; idx = (cp - SEG0_MIN) >> 1;
      } else {
        seg = SEG1; idx = (cp - SEG1_MIN) >> 1;
      }

      seg[idx] = cp & 1
        ? (seg[idx] & 0x0F) | (cat << 4)
        : (seg[idx] & 0xF0) | cat;
    }
  }
  return cursor;
})();

/**
 * `Grapheme_Cluster_Break` property value of a given codepoint
 *
 * @see https://www.unicode.org/reports/tr29/tr29-43.html#Default_Grapheme_Cluster_Table
 *
 * @param {number} cp
 * @return {GraphemeCategoryNum}
 */
function cat(cp) {
  // ASCII fast path
  if (cp < SEG0_MIN) {
    if (cp >= 32) return 0;
    if (cp === 10) return 6;
    if (cp === 13) return 1;
    return 2;
  }
  // Index Segment 0: 0x0080-0x2FFF
  if (cp <= SEG0_MAX) {
    let byte = SEG0[(cp - SEG0_MIN) >> 1];
    return /** @type {GraphemeCategoryNum} */ (cp & 1 ? byte >> 4 : byte & 0x0F);
  }
  // CJK fast path: 0x3000-0x9FFF
  if (cp < SEG1_MIN) {
    if (cp < 0x3030) return cp >= 0x302A ? 3 : 0;
    if (cp < 0x309B) {
      if (cp === 0x3030 || cp === 0x303D) return 4;
      return cp >= 0x3099 ? 3 : 0;
    }
    if (cp === 0x3297 || cp === 0x3299) return 4;
    return 0;
  }
  // Index Segment 1: 0xA000-0xABFF
  if (cp <= SEG1_MAX) {
    let byte = SEG1[(cp - SEG1_MIN) >> 1];
    return /** @type {GraphemeCategoryNum} */ (cp & 1 ? byte >> 4 : byte & 0x0F);
  }
  // Hangul syllables path: 0xAC00-0xD7A3
  if (cp <= 0xD7A3) {
    return (cp - 0xAC00) % 28 === 0 ? 7 : 8; // LV : LVT
  }
  // Hangul Jamo Extended-B path: 0xD7A4-0xD7FF
  if (cp <= 0xD7FF) {
    if (cp <= 0xD7C6) return cp >= 0xD7B0 ? 13 : 0; // V
    return cp >= 0xD7CB ? 12 : 0; // T
  }
  // Private Use fast path: 0xE000-0xFDFF
  if (cp < 0xFE00) {
    return cp === 0xFB1E ? 3 : 0;
  }
  // Specials (0xFE00-0xFFFF) and Non-BMP
  let idx = findUnicodeRangeIndex(cp, grapheme_ranges, SEG_CURSOR);
  return idx < 0 ? 0 : grapheme_ranges[idx][2];
}

/**
 * @param {number} cp
 * @return {boolean}
 */
function isIndicConjunctConsonant(cp) {
  return findUnicodeRangeIndex(cp, consonant_ranges) >= 0;
}
