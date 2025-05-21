// Copyright 2012-2014 The Rust Project Developers. See the COPYRIGHT
// file at the top-level directory of this distribution and at
// http://rust-lang.org/COPYRIGHT.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
//
// Modified original Rust library [source code]
// (https://github.com/unicode-rs/unicode-segmentation/blob/9e3f88c/src/word.rs)
//
// to create JavaScript library [unicode-segmenter]
// (https://github.com/cometkim/unicode-segmenter)

// @ts-check

import { findUnicodeRangeIndex } from "./core.js";
import { WordCategory, word_ranges } from "./_word_data.js";

/**
 * @typedef {import('./_word_data.js').WC_Any} WC_Any
 *
 * @typedef {import('./_word_data.js').WordCategoryNum} WordCategoryNum
 * @typedef {import('./_word_data.js').WordCategoryRange} WordCategoryRange
 *
 * @typedef {object} WordSegmentExtra
 * @property {number} _hd The first code point of the segment
 * @property {WordCategoryNum} _catBegin Beginning Word_Break category of the segment
 * @property {WordCategoryNum} _catEnd Ending Word_Break category of the segment
 *
 * @typedef {import('./core.js').Segmenter<WordSegmentExtra>} WordSegmenter
 */

export { WordCategory };

/**
 * `Word_break` property value of a given codepoint
 *
 * @see https://www.unicode.org/reports/tr29/tr29-43.html#Default_Word_Boundaries
 *
 * @param {number} cp
 * @param {import('./_word_data.js').WordCategoryRange} cache
 * @return {WordCategoryNum}
 */
function cat(cp, cache) {
  if (cp < 127) {
    // Special-case optimization for ascii, except U+007F.  This
    // improves performance even for many primarily non-ascii texts,
    // due to use of punctuation and white space characters from the
    // ascii range.
    if (cp === 11 || cp === 12) {
      return 13 /* WC_Newline */;
    } else if (cp === 13) {
      return 2 /* WC_CR */;
    } else if (cp === 32) {
      return 17 /* WC_WSegSpace */;
    } else if (cp === 34) {
      return 3 /* WC_Double_Quote */;
    } else if (cp === 39) {
      return 16 /* WC_Single_Quote */;
    } else if (cp === 44 || cp === 59) {
      return 11 /* WC_MidNum */;
    } else if (cp === 46) {
      return 12 /* WC_MidNumLet */;
    } else if (cp >= 48 && cp <= 57) {
      return 14 /* WC_Numeric */;
    } else if (cp === 58) {
      return 10 /* WC_MidLetter */;
    } else if (cp === 95) {
      return 5 /* WC_ExtendNumLet */;
    } else if ((cp >= 65 && cp <= 90) || (cp >= 97 && cp <= 122)) {
      return 5 /* WC_ExtendNumLet */;
    } else {
      return 0 /* WC_Any */;
    }
  } else {
    // If this char isn't within the cached range, update the cache to the
    // range that includes it.
    if (cp < cache[0] || cp > cache[1]) {
      let index = findUnicodeRangeIndex(cp, word_ranges);
      if (index < 0) {
        return 0;
      }
      let range = word_ranges[index];
      cache[0] = range[0];
      cache[1] = range[1];
      cache[2] = range[2];
    }
    return cache[2];
  }
}

/**
 * @param {WordCategoryNum} catBefore
 * @param {WordCategoryNum} catAfter
 * @param {number} risCount Regional_Indicator state
 * @param {boolean} emoji Extended_Pictographic state
 * @return {boolean}
 *
 * @see https://www.unicode.org/reports/tr29/tr29-43.html#Word_Boundary_Rules
 */
function isBoundary(catBefore, catAfter, risCount, emoji) {
  // WB3
  if (catBefore === WordCategory.CR && catAfter === WordCategory.LF) {
    return false;
  }

  // WB3a
  if (
    catBefore === WordCategory.Newline ||
    catBefore === WordCategory.CR ||
    catBefore === WordCategory.LF
  ) {
    return true;
  }

  // WB3b
  if (
    catAfter === WordCategory.Newline ||
    catAfter === WordCategory.CR ||
    catAfter === WordCategory.LF
  ) {
    return true;
  }

  // WB3c
  if (catBefore === WordCategory.ZWJ && emoji) {
    return false;
  }

  // WB3d
  if (
    catBefore === WordCategory.WSegSpace &&
    catAfter === WordCategory.WSegSpace
  ) {
    return false;
  }

  // WB5
  if (
    (catBefore === WordCategory.ALetter ||
      catBefore === WordCategory.Hebrew_Letter) &&
    (catAfter === WordCategory.ALetter ||
      catAfter === WordCategory.Hebrew_Letter)
  ) {
    return false;
  }

  // WB13
  if (
    catBefore === WordCategory.Katakana &&
    catAfter === WordCategory.Katakana
  ) {
    return false;
  }

  // WB13a
  if (
    (catBefore === WordCategory.ALetter ||
      catBefore === WordCategory.Hebrew_Letter ||
      catBefore === WordCategory.Numeric ||
      catBefore === WordCategory.Katakana ||
      catBefore === WordCategory.ExtendNumLet) &&
    catAfter === WordCategory.ExtendNumLet
  ) {
    return false;
  }

  // WB13b
  if (
    catBefore === WordCategory.ExtendNumLet &&
    (catBefore === WordCategory.ALetter ||
      catBefore === WordCategory.Hebrew_Letter ||
      catBefore === WordCategory.Numeric ||
      catBefore === WordCategory.Katakana)
  ) {
    return false;
  }

  // WB15, WB16
  if (catBefore === 10 && catAfter === 10) {
    return risCount % 2 === 0;
  }

  // WB999
  return true;
}
