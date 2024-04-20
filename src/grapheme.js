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

import { takeCodePoint } from './utils.js';
import {
  searchGraphemeCategory,
  GraphemeCategory,
} from './_grapheme_table.js';

/**
 * @typedef {import('./core.js').Segmenter<{ _cat: GraphemeCategory }>} GraphemeSegmenter
 * @typedef {import('./_grapheme_table.js').GraphemeCategoryRange} GraphemeCategoryRange
 */

export {
  /**
   * @deprecated Use `searchGraphemeCategory` instead
   */
  searchGraphemeCategory as searchGrapheme,
  searchGraphemeCategory,
  GraphemeCategory,
};


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

  /** @type {GraphemeCategory | null} Category of codepoint immediately preceding cursor, if known. */
  let catBefore = null;

  /** @type {GraphemeCategory | null} Category of codepoint immediately preceding cursor, if known. */
  let catAfter = null;

  /** @type {import('./_grapheme_table.js').GraphemeCategoryRange} */
  let cache = [0, 0, 2 /* GC_Control */];

  /** @type {number} The number of RIS codepoints preceding `cursor`. */
  let risCount = 0;

  /** Emoji state */
  let emoji = false;

  let cp = takeCodePoint(input, cursor, len);
  let ch = String.fromCodePoint(cp);

  let index = 0;
  let segment = '';

  while (true) {
    cursor += ch.length;
    segment += ch;

    catBefore = catAfter;
    if (catBefore === null) {
      catBefore = cat(cp, cache);
    }

    if (cursor < len) {
      cp = takeCodePoint(input, cursor, len);
      ch = String.fromCodePoint(cp);
      catAfter = cat(cp, cache);
    } else {
      yield { segment, index, input, _cat: catBefore };
      return;
    }

    if (catBefore === 10 /* Regional_Indicator*/) {
      risCount += 1;
    } else {
      risCount = 0;
      if (
        catAfter === 14 /* ZWJ */
        && (catBefore === 3 /* Extend */ || catBefore === 4 /* Extended_Pictographic */)
      ) {
        emoji = true;
      }
    }

    if (isBoundary(catBefore, catAfter, risCount, emoji)) {
      yield { segment, index, input, _cat: catBefore };

      // flush
      index = cursor;
      segment = '';
      emoji = false;
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
 * @param {number} cp
 * @param {import('./_grapheme_table.js').GraphemeCategoryRange} cache
 * @return {GraphemeCategory}
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
      let result =  searchGraphemeCategory(cp);
      cache[0] = result[0];
      cache[1] = result[1];
      cache[2] = result[2];
    }
    return cache[2];
  }
};

/**
 * @param {GraphemeCategory} catBefore
 * @param {GraphemeCategory} catAfter
 * @param {number} risCount Regional_Indicator state
 * @param {boolean} emoji Extended_Pictographic state
 * @return {boolean}
 */
// Generated by ReScript v11.0.1
// https://rescript-lang.org/try?version=v11.0.1&code=C4TwDgpgBAxghsKBeAUFKAfKABOBnACgAYBKKAcQGEB9AQQDsQ1Md8CBGMq6ygJWay5CAJi41KAe3rAAThIA2A1oQDMY6gFEAHsAj0AJkqEEALOu26DEfdQAKASxjAJAcxlwwAC0dG2AVnUAGV9CADYggDEQggB2IIA1aIAOBIAVaIBOdVsZCEgDaPZSChpeCBd7KTh5agBJA0cECRlCzhLqAGUwOBh7ehcAWTgZAGtC0Xb09EE2djV2xOnlDjN2gC0AdQApFBR5CER7PAAhCQBXA2GQZCgCeGBjiAAzZogAGlgEWifdGQ+ZI6SC7AD4QAC2EgAVvYyEgAHxQADezDwAHd7MAYJ5bvdHi9ch97t9fmRkUsCNw+B9uIEIrCEU9qnhoAB6FkUY4qJQU8RSWQKD7UelQWRnVns8jHEzcym8QXC0XijnS8k0iLy5AIxVQNnK7nUam86RyeQKmRinUS45+fWGni8M0W3WSm3kg3tWmOpUumU0QJ2wLCxnyZmWjmhX3Uf0LINM73HCOqv0B+KxkPxxMsHlRlOpNOh50JyOBeJ21OaqDBgtWmLF0uTfPx2tJ6j17jl+GVuNhyXNrPtu15itVpt11KDxs945JSPjhvD7uFmduu0WPT6SeFjK29bbTdW7cr9pdHp9QbDEb7jkZOCRnJ5dcazsjqcZABGkc2W1XOnX1jsjjOG4HjeDAwoAITglC9hTuw7CRmUFRVDU9T6I0zh-O0iGVPQ1R1A09zNMKAJ4EC0gALRwhC+gEBMSBIFARCwcI1LHHMO5ChW2pbhkh5QAAvigglAA
function isBoundary(catBefore, catAfter, risCount, emoji) {
  switch (catBefore) {
    case 1:
      return catAfter !== 6;
    case 5:
      switch (catAfter) {
        case 0:
        case 4:
        case 9:
        case 10:
        case 12:
          return true;
        case 5:
        case 7:
        case 8:
        case 13:
          return false;
      }
      break;
    case 2:
    case 6:
      return true;
    case 7:
      switch (catAfter) {
        case 12:
        case 13:
            return false;
        case 1:
        case 2:
        case 3:
        case 6:
        case 11:
        case 14:
          break;
        default:
          return true;
      }
      break;
    case 8:
      switch (catAfter) {
        case 12:
          return false;
        case 1:
        case 2:
        case 3:
        case 6:
        case 11:
        case 14:
          break;
        default:
          return true;
      }
      break;
    case 10:
      switch (catAfter) {
        case 10:
          return risCount % 2 === 0;
        case 1:
        case 2:
        case 3:
        case 6:
        case 11:
        case 14:
          break;
        default:
          return true;
      }
      break;
    case 12:
      switch (catAfter) {
        case 12 :
          return false;
        case 1:
        case 2:
        case 3:
        case 6:
        case 11:
        case 14:
          break;
        default:
          return true;
      }
      break;
    case 13:
       switch (catAfter) {
        case 12:
        case 13:
          return false;
        case 1:
        case 2:
        case 3:
        case 6:
        case 11:
        case 14:
          break;
        default:
          return true;
       }
       break;
    case 14:
      switch (catAfter) {
        case 4:
          return !emoji;
        case 1:
        case 2:
        case 3:
        case 6:
        case 11:
        case 14:
          break;
        default:
          return true;
      }
      break;
  }
  switch (catAfter) {
    case 1:
    case 2:
    case 6:
      return true;
    case 3:
    case 11:
    case 14:
      return false;
    default:
      return catBefore !== 9;
  }
}
