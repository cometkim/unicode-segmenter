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
import { takeCodePoint } from './utils.js';
import {
  searchGraphemeCategory,
  GraphemeCategory,
} from './_grapheme_table.js';
import {
  consonant_table,
} from './_incb_table.js';

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

  /** InCB=Consonant */
  let consonant = false;

  /** InCB=Linker */
  let linker = false;

  /** InCB=Consonant InCB=Linker x InCB=Consonant */
  let incb = false;

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

    if (!consonant && catBefore === 0) {
      consonant = isIndicConjunctCosonant(cp);
    } else if (catBefore === 3) {
      linker = isIndicConjunctLinker(cp);
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

      // Put GB9c rule checking here to reduce.
      } else if (catAfter === 0 /* Any */) {
        incb = consonant && linker && isIndicConjunctCosonant(cp);
      }
    }

    if (isBoundary(catBefore, catAfter, risCount, emoji, incb)) {
      yield { segment, index, input, _cat: catBefore };

      // flush
      index = cursor;
      segment = '';
      emoji = false;
      consonant = false;
      linker = false;
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
  return (cp === 0x094D || cp === 0x09CD || cp === 0x0ACD || cp === 0x0B4D || cp === 0x0C4D || cp === 0x0D4D);
}

/**
 * @param {GraphemeCategory} catBefore
 * @param {GraphemeCategory} catAfter
 * @param {number} risCount Regional_Indicator state
 * @param {boolean} emoji Extended_Pictographic state
 * @param {boolean} incb Indic_Conjunct_Break state
 * @return {boolean}
 */
// Generated by ReScript v11.1.0
// https://rescript-lang.org/try?version=v11.1.0&code=C4TwDgpgBAxghsKBeAUFKAfKABOBnACgAYBKKAcQGEB9AQQDsQ1Md8CBGMq6ygJWay5CAJi41KAe3rAAThIA2A1oQDMY6gFEAHsAj0AJkqEEALOu26DEfdQAKASxjAJAcxlwwAC0dG2AVnUAGV9CADYggDEQggB2IIA1aIAOBIAVaIBOdVsZCEgDaPZSChpeCBd7KTh5agBJA0cECRlCzhLqAGUwOBh7ehcAWTgZAGtC0Xb09EE2djV2xOnlDjN2gC0AdQApFBR5CER7PAAhCQBXA2GQZCgCeGBjiAAzZogAGlgEWifdGQ+ZI6SC7AD4QAC2EgAVvYPn0YAAjMhIAB8UAA3sw8AB3ezAGCeW73R4vXIfe7fX5kDFLAjcPgfbiBCJI1FPap4aAAek5FGOKiUtPEUlkCg+1BZUFkZy5PPIxxMArpvDFEqlMt5CppjIiKuQqLVUG5GoF1AZQukcnkqpk0sNsuOfhNZp4vGttqNcsdNNN7SZbvVnsVNECzsCErZ8g5dt5oSD1BDC3D7IDx1jWuDofiScjKbTLEF8czqWzUY9qbjgXizqzeqgEdL9piFarkxLKab6eoLe4NZRdeT0blHfzPedxdr9fbzdSY7bg+OSTjM9bE4HZcX3udFj0+jnZYyTvW2z39oPm-aXR6fUGwxGJ95GTgcZyeR3ur7k-nGXhKG5WAIPrcAwIBkPYTxQHC8KrjmX4wLcEIAG7WJKEhQPCEDyBIWIobAEhgt0ThQJhFQwCQcabFsW46Du1h2I4zhuB43ikbWACE4JQvY87sOwcZlBUVQ1PU+iNM4fztPxlT0NUdQNPczQSgCeBAtIAC0yIQvoBATEgSBQEQ3HCAyxxzIe4psZBsHGRkNnMAAvigdlAA
function isBoundary(catBefore, catAfter, risCount, emoji, incb) {
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
          return !incb;
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
          return !incb;
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
          return !incb;
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
          return !incb;
      }
      break;
    case 12:
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
          return !incb;
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
          return !incb;
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
          return !incb;
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
      if (catBefore === 9) {
        return false;
      } else {
        return !incb;
      }
  }
}
