import { searchGrapheme } from './_grapheme_table.js';

/**
 * Note:
 *
 * This code provides an alternative implementation of the generator version, offering a ~15% performance improvement.
 * See [../benchmark/class-vs-generator.js]
 *
 * However, it has not been used due to increased bundle size and limitations of encapsulation.
 *
 * While it may be reconsidered in the future, it is currently inactive.
 */

/**
 * @typedef {import('./_grapheme_table.js').GraphemeCategory} GraphemeCategory
 * @typedef {import('./_grapheme_table.js').GraphemeSearchResult} GraphemeSearchResult
 *
 * @typedef {(
 *   | GS_Unknown
 *   | GS_NotBreak
 *   | GS_Break
 *   | GS_Regional
 *   | GS_Emoji
 * )} GraphemeState
 */
/** No information is known */
const GS_Unknown = 0;
/** It is known to not be a boundary. */
const GS_NotBreak = 1;
/** It is known to be a boundary. */
const GS_Break = 2;
/** The codepoint after is a Regional Indicator Symbol, so a boundary iff it is preceded by an even number of RIS codepoints. (GB12, GB13) */
const GS_Regional = 3;
/** The codepoint after is Extended_Pictographic, so whether it's a boundary depends on pre-context according to GB11. */
const GS_Emoji = 4;

export class GraphemeSegments {
  /**
   * @param {string} str
   */
  constructor(str) {
    /** @type {boolean} Iterator protocol flag */
    this.done = false;

    /** @type {string} */
    this.input = str;

    /** @type {number} Current cursor position. */
    this.cursor = 0;

    /** @type {number} Total length of the string. */
    this.len = str.length;

    /** @type {GraphemeState} Information about the potential boundary at `cursor` */
    this.state = GS_Break;

    /** @type {GraphemeCategory | null} Category of codepoint immediately preceding cursor, if known. */
    this.catBefore = null;

    /** @type {GraphemeCategory | null} Category of codepoint immediately preceding cursor, if known. */
    this.catAfter = null;

    /** @type {GraphemeSearchResult} */
    this.cache = [0, 0, base.GC_Control];

    /** @type {number} The number of RIS codepoints preceding `cursor`. */
    this.risCount = 0;
  }

  [Symbol.iterator]() {
    return this;
  }

  next() {
    let { done, input, cursor, len } = this;
    if (done || cursor === len) {
      return { done: true };
    }

    let ch = this._take();
    let segment = ch;

    while (true) {
      this.cursor += ch.length;

      if (this.cursor === len) {
        this.done = true;

        let value = { segment, input, index: cursor };
        return { done: false, value };
      }

      this.state = GS_Unknown;

      this.catBefore = this.catAfter;
      if (this.catBefore === null) {
        this.catBefore = this._cat(ch);
      }

      if (this.catBefore === base.GC_Regional_Indicator) {
        this.risCount += 1;
      } else {
        this.risCount = 0;
      }

      ch = this._take();
      this.catAfter = this._cat(ch);

      if (this._isBoundary(this.catBefore, this.catAfter)) {
        let value = { segment, input, index: cursor };
        return { done: false, value };
      }

      segment += ch;
    }
  }

  isComplete() {
    return this.state === GS_Break;
  }

  /**
   * @return {string}
   * Take a unicode character sequence from the current cursor
   */
  _take() {
    let { cursor, input, len } = this;

    let hi = input.charCodeAt(cursor);
    if (0xd800 <= hi && hi <= 0xdbff) {
      if (cursor + 1 < len) {
        let lo = input.charCodeAt(cursor + 1);
        if (0xdc00 <= lo && lo <= 0xdfff) {
          return String.fromCodePoint(((hi - 0xd800) << 10) + (lo - 0xdc00) + 0x10000);
        }
      }
    }

    return String.fromCodePoint(hi);
  }

  /**
   * @param {boolean} isBreak
   * @return {boolean} Identity
   */
  _decision(isBreak) {
    this.state = isBreak ? GS_Break : GS_NotBreak;
    return isBreak;
  }

  /**
   * @param {string} ch
   * @return {GraphemeCategory}
   */
  _cat(ch) {
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
      let cp = ch.codePointAt(0);
      // If this char isn't within the cached range, update the cache to the
      // range that includes it.
      if (cp < this.cache[0] || cp > this.cache[1]) {
        this.cache = searchGrapheme(ch);
      }
      return this.cache[2];
    }
  }

  /**
   * @param {GraphemeCategory} catBefore
   * @param {GraphemeCategory} catAfter
   * @return {boolean}
   */
  _isBoundary(catBefore, catAfter) {
    switch (checkPair(catBefore, catAfter)) {
      case 0 /* P_NotBreak */:
      case 2 /* P_Extended */:
        // Always handle extended characters
      case 4:
        // Here is always ZWJ + emoji combo
        return this._decision(false);
      case 1:
        return this._decision(true);
      case 3:
        return this._decision(risCount % 2 === 0);
    }
  }
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
