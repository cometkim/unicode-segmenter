// @ts-check

import { BND, cat, nextState } from './grapheme-core.js';

/**
 * Count number of extended grapheme clusters in given text.
 *
 * The result is identical to `countGraphemes` of the
 * `unicode-segmenter/grapheme` entry, but this one runs the boundary
 * rules directly without allocating segment objects or slicing strings,
 * so counting is significantly faster.
 *
 * It is a standalone entry so that counting doesn't have to carry the
 * segmenter code, and vice versa - even without tree-shaking.
 *
 * @param {string} text
 * @return {number} count of grapheme clusters
 */
export function countGraphemes(text) {
  let len = text.length;
  if (len === 0) return 0;

  let cp = /** @type {number} */ (text.codePointAt(0));
  let cursor = 0;

  /** Category of the last consumed code point */
  let catBefore = cat(cp);
  let catAfter = catBefore;

  /** Packed sequence state; see `grapheme-core.js` */
  let st = 0;

  /** The segment being scanned counts, whether or not a boundary follows */
  let count = 0;

  for (;;) {
    cursor += cp > 0xFFFF ? 2 : 1;
    st = nextState(st, catAfter, cp);
    let boundary = 1;
    if (cursor < len) {
      cp = /** @type {number} */ (text.codePointAt(cursor));
      catAfter = cat(cp);
      boundary = BND[(catBefore << 4 | catAfter) << 5 | st];
    }

    if (boundary) {
      count += boundary;
      if (cursor >= len) break;
    }

    catBefore = catAfter;
  }

  return count;
}
