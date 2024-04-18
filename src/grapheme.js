// @ts-check

import { searchGrapheme, GraphemeCategory } from './_grapheme_table.js';
import { takeChar } from './utils.js';

/**
 * @typedef {import('./core.js').Segmenter<{ _cat: GraphemeCategory }>} Segmenter
 * @typedef {import('./_grapheme_table.js').GraphemeSearchResult} GraphemeSearchResult
 */

export {
  searchGrapheme,
  GraphemeCategory,
};

/**
 * @param {string} input
 * @return {Segmenter}
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

  /** @type {GraphemeSearchResult} */
  let cache = [0, 0, 2 /* GC_Control */];

  /** @type {number} The number of RIS codepoints preceding `cursor`. */
  let risCount = 0;

  /** Emoji state */
  let emoji = false;

  /**
   * @param {number} cp
   * @return {GraphemeCategory}
   */
  let categoryOf = (cp) => {
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
        cache = searchGrapheme(cp);
      }
      return cache[2];
    }
  };

  /**
   * @param {GraphemeCategory} catBefore
   * @param {GraphemeCategory | null} catAfter
   * @return {boolean}
   */
  let isBoundary = (catBefore, catAfter) => {
    switch (checkPair(catBefore, catAfter)) {
      case 0 /* P_NotBreak */:
      case 2 /* P_Extended */:
        // Always handle extended characters
        return false;
      case 1 /* P_Break */:
        return true;
      case 3 /* P_Regional */:
        return risCount % 2 === 0;
      case 4 /* P_Emoji */:
        // Here is always ZWJ + emoji combo
        return !emoji;
    }
  };

  let ch = takeChar(input, cursor, len);

  let segment = '';
  let index = cursor;

  while (cursor < len) {
    cursor += ch.length;
    segment += ch;

    catBefore = catAfter;
    if (catBefore === null) {
      /** @type {number} */
      // @ts-ignore
      let cp = ch.codePointAt(0);
      catBefore = categoryOf(cp);
    }

    if (catBefore === 10 /* Regional_Indicator*/) {
      risCount += 1;
    } else {
      risCount = 0;
    }

    if (cursor < len) {
      ch = takeChar(input, cursor, len);
      /** @type {number} */
      // @ts-ignore
      let cp = ch.codePointAt(0);
      catAfter = categoryOf(cp);
    }

    if (
      (catBefore === 3 /* Extend */ || catBefore === 4 /* Extended_Pictographic */)
      && catAfter === 14 /* ZWJ */
    ) {
      // begin emoji sequance
      emoji = true;
    }

    if (isBoundary(catBefore, catAfter)) {
      yield { segment, index, input, _cat: catBefore };

      // flush
      index = cursor;
      segment = '';
      emoji = false;
    }
  }

  if (segment) {
    // @ts-ignore
    yield { segment, index, input, _cat: catBefore };
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
 * @typedef {0} P_NotBreak
 * @typedef {1} P_Break
 * @typedef {2} P_Extended
 * @typedef {3} P_Regional
 * @typedef {4} P_Emoji
 * @typedef {(
 *   | P_NotBreak
 *   | P_Break
 *   | P_Extended
 *   | P_Regional
 *   | P_Emoji
 * )} PairResult
 */

/**
 * @param {GraphemeCategory} before
 * @param {GraphemeCategory | null} after
 * @return {PairResult}
 *
 * Generated by ReScript v11.0.1
 * https://rescript-lang.org/try?version=v11.0.1&code=C4TwDgpgBAxghsKBeAUFKAfKABOBnACgDsBXAGzIEooA5cstTHfAgBmoHEBhAfQEEiIRllyEAjJ15cASsOaEATJJ5cA9kWAAnVQ3QiWAZmUBRAB7AIRACZzRBACwnzlqxCs8ACgEsYwVQHNNODAACx9bFgBWZQAZCMIANliAMXiCAHZYgDU0gA5sgBU0gE5lD00ISGs0sXYobh5pCH8vdTgyHgBJax8EVU0aiXreAGUwOBgvIn8AWThNAGsapWGeIr15AjEjVZyNuzFHVYAtAHUAKRQUUEgoca9NJrxyRFR9ljqaVWAAIQq4JbvcTUP4QAFpFZmCzWNxpHZNFptXRMOxHYwAW1UACsvFcyBBEDAQhAYAsPHAHsgoAQAEYQABm-QgABooHB6RZNNQkAA+Rh4ADuXmAROpdMZFVZ7M51AA3nICA0ZKyGjFktyebRvqCAVAAPR6+o-AwKpXqLQ6Vk8DVQHULfWGjg-eymqTSK02u0Oo0ujaK3hqj3ITVeg0+hU8FVSc3aKjB23-e1hp2RCNRlTST2J70ptOrNVZsFJx0-VN+1XpmI2r6-bPJn4JV08GLprLV7V1kuN8sBytt+M10Ndpst-NZArt2tFnMNkdZVuTodG9Jz9MTgcd6f1lc9njz3aLzvLpv7hrr3laqe67dzgprw9bku5Jt31bnzWDo9O59+yOrKEuA+14lsUeYNGc5xAcWRqgb+6ZjBMUyzPMCw2gBMJWDOxRwE25SVC4QYXuhriYfWxQ0k2EHpsRbieD4fiBMEYQwGhmI4jOYhiE2CKtEQ7RdD08B+Jo6Y8UiAlWL0wk2mJfFkBxCgqj82x5ta8ZLk6xRaYwAC+KBAA
 */
function checkPair(before, after) {
  switch (before) {
    case 1 :
        if (after === 6) {
          return 0;
        } else {
          return 1;
        }
    case 5 :
        switch (after) {
          case null :
          case 0 :
          case 4 :
          case 9 :
          case 10 :
          case 12 :
              return 1;
          case 5 :
          case 7 :
          case 8 :
          case 13 :
              return 0;
          default:
            
        }
        break;
    case 2 :
    case 6 :
        return 1;
    case 7 :
        switch (after) {
          case 12 :
          case 13 :
              return 0;
          case 1 :
          case 2 :
          case 3 :
          case 6 :
          case 11 :
          case 14 :
              break;
          default:
            return 1;
        }
        break;
    case 8 :
        switch (after) {
          case 12 :
              return 0;
          case 1 :
          case 2 :
          case 3 :
          case 6 :
          case 11 :
          case 14 :
              break;
          default:
            return 1;
        }
        break;
    case 10 :
        switch (after) {
          case 10 :
              return 3;
          case 1 :
          case 2 :
          case 3 :
          case 6 :
          case 11 :
          case 14 :
              break;
          default:
            return 1;
        }
        break;
    case 12 :
        switch (after) {
          case 12 :
              return 0;
          case 1 :
          case 2 :
          case 3 :
          case 6 :
          case 11 :
          case 14 :
              break;
          default:
            return 1;
        }
        break;
    case 13 :
        switch (after) {
          case 12 :
          case 13 :
              return 0;
          case 1 :
          case 2 :
          case 3 :
          case 6 :
          case 11 :
          case 14 :
              break;
          default:
            return 1;
        }
        break;
    case 14 :
        switch (after) {
          case 4 :
              return 4;
          case 1 :
          case 2 :
          case 3 :
          case 6 :
          case 11 :
          case 14 :
              break;
          default:
            return 1;
        }
        break;
  }
  switch (after) {
    case 1 :
    case 2 :
    case 6 :
        return 1;
    case 11 :
        return 2;
    case 3 :
    case 14 :
        return 0;
    default:
      if (before === 9) {
        return 2;
      } else {
        return 1;
      }
  }
}
