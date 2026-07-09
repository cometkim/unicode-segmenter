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
  let st = (0xC418 >> catBefore) & 1 ? nextState(0, catBefore, cp) : 0;

  /** The segment being scanned counts, whether or not a boundary follows */
  let count = 1;

  while (cursor < len) {
    cp = /** @type {number} */ (text.codePointAt(cursor));
    if (cp < 0x7F && cp >= 0x20) {
      // Printable ASCII fast path. Every one is `Any`: a boundary always
      // precedes it (a pair ending in `Any` is never state-dependent)
      // except after Prepend (GB9b), and it resets the sequence state.
      // The rest of the run needs no category or boundary lookups at all.
      if (catBefore !== 9) count += 1;
      cursor += 1;
      while (cursor < len && (cp = text.charCodeAt(cursor)) < 0x7F && cp >= 0x20) {
        count += 1;
        cursor += 1;
      }
      catBefore = 0;
      st = 0;
      continue;
    }
    let catAfter = cat(cp);
    count += BND[(catBefore << 4 | catAfter) << 5 | st];
    st = (0xC418 >> catAfter) & 1 && (st !== 0 || catAfter !== 3)
      ? nextState(st, catAfter, cp)
      : 0;
    cursor += cp > 0xFFFF ? 2 : 1;
    catBefore = catAfter;
  }

  return count;
}
