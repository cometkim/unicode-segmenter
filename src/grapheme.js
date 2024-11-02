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

import { bsearchRange } from './core.js';
import { isBMP } from './utils.js';
import {
  searchGraphemeIndex,
  grapheme_range_table,
  grapheme_cat_table,
  GraphemeCategory,
} from './_grapheme_table.js';
import {
  consonant_table,
} from './_incb_table.js';

/**
 * @typedef {import('./_grapheme_table.js').GC_Any} GC_Any
 *
 * @typedef {import('./_grapheme_table.js').GraphemeCategoryNum} GraphemeCategoryNum
 * @typedef {import('./_grapheme_table.js').GraphemeCategoryRange} GraphemeCategoryRange
 *
 * @typedef {object} GraphemeSegmentExtra
 * @property {GraphemeCategoryNum} _catBegin Beginning Grapheme_Cluster_Break category of the segment
 * @property {GraphemeCategoryNum} _catEnd Ending Grapheme_Cluster_Break category of the segment
 *
 * @typedef {import('./core.js').Segmenter<GraphemeSegmentExtra>} GraphemeSegmenter
 */

export {
  /**
   * @deprecated DO NOT USE directly, will be removed in v1
   */
  searchGraphemeCategory as searchGrapheme,
  GraphemeCategory,
};

/**
 * @deprecated DO NOT USE directly, will be removed in v1
 * @param {number} cp
 * @return A {@link GraphemeCategoryRange} value if found, or garbage `start` and `padding` values with {@link GC_Any} category.
 */
export function searchGraphemeCategory(cp) {
  let index = searchGraphemeIndex(cp);
  if (index < 0) {
    return [
      grapheme_range_table[-index],
      0,
      0 /* GC_Any */,
    ];
  } else {
    return [
      grapheme_range_table[index],
      grapheme_range_table[index + 1],
      grapheme_cat_table[index >> 1],
    ];
  }
}

/**
 * @param {string} input
 * @return {GraphemeSegmenter}
 */
export function* graphemeSegments(input) {
  // do nothing on empty string
  if (input === '') {
    return;
  }

  /** @type {number} Current cursor position. */
  let cursor = 0;

  /** @type {number} Total length of the input string. */
  let len = input.length;

  /** @type {GraphemeCategoryNum | null} Category of codepoint immediately preceding cursor, if known. */
  let catBefore = null;

  /** @type {GraphemeCategoryNum | null} Category of codepoint immediately preceding cursor, if known. */
  let catAfter = null;

  /** @type {GraphemeCategoryNum | null} Beginning category of a segment */
  let catBegin = null;

  /** @type {import('./_grapheme_table.js').GraphemeCategoryRange} */
  let cache = [0, 0, 2 /* GC_Control */];

  /** @type {number} The number of RIS codepoints preceding `cursor`. */
  let risCount = 0;

  /** Emoji state */
  let emoji = false;

  /** InCB=Consonant */
  let consonant = false;

  /** InCB=Linker */
  let linker = false;

  /** InCB=Consonant InCB=Linker x InCB=Consonant */
  let incb = false;

  /** @type number */
  // @ts-ignore
  let cp = input.codePointAt(cursor);

  let index = 0;
  let segment = '';

  while (true) {
    segment += input[cursor++];
    if (!isBMP(cp)) {
      segment += input[cursor++];
    }

    // Note: Of course the nullish coalescing is useful here,
    // but avoid it for aggressive compatibility and perf claim
    catBefore = catAfter;
    if (catBefore === null) {
      catBefore = cat(cp, cache);
      catBegin = catBefore;
    }

    // Note: Lazily update `consonant` and `linker` state
    // which is a extra overhead only for Hindi text.
    if (!consonant && catBefore === 0) {
      consonant = isIndicConjunctCosonant(cp);
    } else if (catBefore === 3 /* Extend */) {
      // Note: \p{InCB=Linker} is a subset of \p{Extend}
      linker = isIndicConjunctLinker(cp);
    }

    if (cursor < len) {
      // @ts-ignore
      cp = input.codePointAt(cursor);
      catAfter = cat(cp, cache);
    } else {
      yield {
        segment,
        index,
        input,
        // @ts-ignore
        _catBegin: catBegin,
        _catEnd: catBefore,
      };
      return;
    }

    if (catBefore === 10 /* Regional_Indicator */) {
      risCount += 1;
    } else {
      risCount = 0;
      if (
        catAfter === 14 /* ZWJ */
        && (catBefore === 3 /* Extend */ || catBefore === 4 /* Extended_Pictographic */)
      ) {
        emoji = true;

        // Note: Put GB9c rule checking here to reduce.
      } else if (catAfter === 0 /* Any */) {
        incb = consonant && linker && (consonant = isIndicConjunctCosonant(cp));
        // It cannot be both a linker and a consonant.
        linker = linker && !consonant;
      }
    }

    if (isBoundary(catBefore, catAfter, risCount, emoji, incb)) {
      yield {
        segment,
        index,
        input,
        // @ts-ignore
        _catBegin: catBegin,
        _catEnd: catBefore,
      };

      // flush
      index = cursor;
      segment = '';
      emoji = false;
      incb = false;
      catBegin = catAfter;
    }
  }
}

/**
 * @param {string} str
 * @return number count of graphemes
 */
export function countGrapheme(str) {
  let count = 0;
  for (let _ of graphemeSegments(str)) count += 1;
  return count;
}

/**
 * `Grapheme_Cluster_Break` property value of a given codepoint
 *
 * @see https://www.unicode.org/reports/tr29/tr29-43.html#Default_Grapheme_Cluster_Table
 *
 * @param {number} cp
 * @param {import('./_grapheme_table.js').GraphemeCategoryRange} cache
 * @return {GraphemeCategoryNum}
 */
function cat(cp, cache) {
  if (cp < 127) {
    // Special-case optimization for ascii, except U+007F.  This
    // improves performance even for many primarily non-ascii texts,
    // due to use of punctuation and white space characters from the
    // ascii range.
    if (cp >= 32) {
      return 0 /* GC_Any */;
    } else if (cp === 10) {
      return 6 /* GC_LF */;
    } else if (cp === 13) {
      return 1 /* GC_CR */;
    } else {
      return 2 /* GC_Control */;
    }
  } else {
    // If this char isn't within the cached range, update the cache to the
    // range that includes it.
    if (cp < cache[0] || cp > cache[1]) {
      let index = searchGraphemeIndex(cp);
      if (index < 0) {
        return 0;
      }
      cache[0] = grapheme_range_table[index];
      cache[1] = grapheme_range_table[index + 1];
      // @ts-ignore
      cache[2] = grapheme_cat_table[index >> 1];
    }
    return cache[2];
  }
};

/**
 * @param {number} cp
 * @return {boolean}
 */
function isIndicConjunctCosonant(cp) {
  return bsearchRange(cp, consonant_table) >= 0;
}

/**
 * @param {number} cp
 * @return {boolean}
 */
function isIndicConjunctLinker(cp) {
  return (
    cp === 2381 /* 0x094D */ ||
    cp === 2509 /* 0x09CD */ ||
    cp === 2765 /* 0x0ACD */ ||
    cp === 2893 /* 0x0B4D */ ||
    cp === 3149 /* 0x0C4D */ ||
    cp === 3405 /* 0x0D4D */
  );
}

/**
 * @param {GraphemeCategoryNum} catBefore
 * @param {GraphemeCategoryNum} catAfter
 * @param {number} risCount Regional_Indicator state
 * @param {boolean} emoji Extended_Pictographic state
 * @param {boolean} incb Indic_Conjunct_Break state
 * @return {boolean}
 *
 * @see https://www.unicode.org/reports/tr29/tr29-43.html#Grapheme_Cluster_Boundary_Rules
 */
function isBoundary(catBefore, catAfter, risCount, emoji, incb) {
  // GB3
  if (catBefore === 1 && catAfter === 6) {
    return false;
  }

  // GB4
  if (catBefore === 1 || catBefore === 2 || catBefore === 6) {
    return true;
  }

  // GB5
  if (catAfter === 1 || catAfter === 2 || catAfter === 6) {
    return true;
  }

  // GB6
  if (
    catBefore === 5 &&
    (catAfter === 5 || catAfter === 7 || catAfter === 8 || catAfter === 13)
  ) {
    return false;
  }

  // GB7
  if (
    (catBefore === 7 || catBefore === 13) &&
    (catAfter === 12 || catAfter === 13)
  ) {
    return false;
  }

  // GB8
  if (
    catAfter === 12 &&
    (catBefore === 8 || catBefore === 12)
  ) {
    return false;
  }

  // GB9
  if (catAfter === 3 || catAfter === 14) {
    return false;
  }

  // GB9a
  if (catAfter === 11) {
    return false;
  }

  // GB9b
  if (catBefore === 9) {
    return false;
  }

  // GB9c
  if (catAfter === 0 && incb) {
    return false;
  }

  // GB11
  if (catBefore === 14 && catAfter === 4) {
    return !emoji;
  }

  // GB12, GB13
  if (catBefore === 10 && catAfter === 10) {
    return risCount % 2 === 0;
  }

  // GB999
  return true;
}

