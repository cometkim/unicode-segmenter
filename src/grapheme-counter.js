// @ts-check

import { PAIR, cat, nextState } from './grapheme-core.js';

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
  let st = (0xC418 >> catBefore) & 1 ? nextState(0, catBefore, cp) : 0;

  /** The segment being scanned counts, whether or not a boundary follows */
  let count = 1;

  while (cursor < len) {
    cp = /** @type {number} */ (text.codePointAt(cursor));
    let catAfter = cat(cp);
    let d = PAIR[catBefore << 4 | catAfter];
    let boundary;
    if (d === 0) boundary = true;
    else if (d === 1) boundary = false;
    else if (d === 2) boundary = !(st & 1);
    else if (d === 3) boundary = !(st & 4);
    else boundary = (st & 24) !== 16;

    st = (0xC418 >> catAfter) & 1 && (st !== 0 || catAfter !== 3)
      ? nextState(st, catAfter, cp)
      : 0;

    if (boundary) count += 1;
    cursor += cp > 0xFFFF ? 2 : 1;
    catBefore = catAfter;
  }

  return count;
}
