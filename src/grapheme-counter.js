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
  let cursor = cp > 0xFFFF ? 2 : 1;

  /** Category of the last consumed code point */
  let catBefore = cat(cp);

  /** Packed sequence state; see `grapheme-core.js` */
  let st = nextState(0, catBefore, cp);

  /** The segment being scanned counts, whether or not a boundary follows */
  let count = 1;

  while (cursor < len) {
    cp = /** @type {number} */ (text.codePointAt(cursor));
    let catAfter = cat(cp);
    let boundary = BND[(catBefore << 4 | catAfter) << 5 | st];

    if (boundary) count += 1;
    cursor += cp > 0xFFFF ? 2 : 1;
    catBefore = catAfter;
    st = nextState(st, catAfter, cp);
  }

  return count;
}
