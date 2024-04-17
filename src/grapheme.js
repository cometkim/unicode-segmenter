// @ts-check

import { searchGrapheme, GraphemeCategory } from './_grapheme_table.js';
import { takeChar } from './utils.js';

/**
 * @typedef {import('./core.js').Segmenter} Segmenter
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

  /**
   * @param {string} ch
   * @return {GraphemeCategory}
   */
  let categoryOf = (ch) => {
    if (ch <= '\u{007e}') {
      // Special-case optimization for ascii, except U+007F.  This
      // improves performance even for many primarily non-ascii texts,
      // due to use of punctuation and white space characters from the
      // ascii range.
      if (ch >= '\u{0020}') {
        return 0 /* GC_Any */;
      } else if (ch == '\n') {
        return 6 /* GC_LF */;
      } else if (ch == '\r') {
        return 1 /* GC_CR */;
      } else {
        return 2 /* GC_Control */;
      }
    } else {
      /** @type {number} */
      // @ts-ignore ch is never empty
      let cp = ch.codePointAt(0);
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
   * @param {GraphemeCategory} catAfter
   * @return {boolean}
   */
  let isBoundary = (catBefore, catAfter) => {
    switch (checkPair(catBefore, catAfter)) {
      case 0 /* P_NotBreak */:
      case 2 /* P_Extended */:
        // Always handle extended characters
      case 4 /* P_Emoji */:
        // Here is always ZWJ + emoji combo
        return false;
      case 1 /* P_Break */:
        return true;
      case 3 /* P_Regional */:
        return risCount % 2 === 0;
    }
  };

  let ch = takeChar(input, cursor, len);
  let segment = ch;

  while (true) {
    cursor += ch.length;

    let index = cursor - segment.length;

    if (cursor === len) {
      yield { segment, input, index };
      break;
    }

    catBefore = catAfter;
    if (catBefore === null) {
      catBefore = categoryOf(ch);
    }

    if (catBefore === 10 /* GC_Regional_Indicator*/) {
      risCount += 1;
    } else {
      risCount = 0;
    }

    ch = takeChar(input, cursor, len);
    catAfter = categoryOf(ch);

    if (isBoundary(catBefore, catAfter)) {
      yield { segment, input, index };
      segment = '';
    }

    segment += ch;
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
 * @param {GraphemeCategory} after
 * @return {PairResult}
 *
 * Generated by ReScript v11.0.1
 * https://rescript-lang.org/try?version=v11.0.1&code=C4TwDgpgBAxghsKBeAUFKAfKABOBnACgAYBKKAcQGEB9AQQDsQ1Md8CBGMq6ygJWay5CAJi41KAe3rAAThIA2A1oQDMY6gFEAHsAj0AJkqEEALOu26DEfdQAKASxjAJAcxlwwAC0dG2AVnUAGV9CADYggDEQggB2IIA1aIAOBIAVaIBOdVsZCEgDaPZSChpeCBd7KTh5agBJA0cECRlCzhLqAGUwOBh7ehcAWTgZAGtC0Xb09EE2djV2xOnlDjN2gC0AdQApFBRQSChu+xkyvABXeURUJeNigDkJYAAhXLgxm9myF4g36ImLPT6azReZlCpVRQfQirDQAWwkACt7Lt5BBEDBPBAYCNbHBjsgoAQAEYQABmzQgABooHBSboZGQkAA+Zh4ADu9mAGMJJPJuWptPpZAA3koCNw+NTuIEIoymVAHs9XiMoAB6VUUJ4qMUSqSyBTU6hyqDfN5qjXkJ4mHXiXiG42mlXqzXWpbimgy+3IeWO80usXUKXiPVyeQO5V+y1+ANBni8cM-J0Wp7Rt2B9oyhNm51Rm3UQKxwLGxW+nNPUJ5gsLYuPUvJitu6WF+I1pWJyPlyvN1Ktuuahssd35+KxlvehW1iNlmKVkeTXtT5Mzxs0OfcMfMidt7NLvNrmg98clxea5eD6XxVKxw+b4-tstJPNX+dHyf35OPtOxgEGBfvzUZDG6zbH+O4AUB3BdD0fSDMMIzGj+QL6B2GRwHmOR5ICXqboh1goUSeabFs346IC1h2I4zhuB43gwAh8JIh27DsHmYKVPQ1R1A08DODIsZsRCXH6I0vHGgJHHyExwhSk8cxAUa459paGQqcwAC+KBAA
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
