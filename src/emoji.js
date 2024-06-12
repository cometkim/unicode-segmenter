// @ts-check

import { bsearchRange } from './core.js';
import {
  emoji_presentation_table,
  extended_pictographic_table,
} from './_emoji_table.js';

/**
 * An alias to {@link isExtendedPictographic}
 *
 * @deprecated in favor of {@link isExtendedPictographic}, will be removed in v1.
 *
 * @param {number} cp
 * @return boolean
 */
export function isEmoji(cp) {
  return isExtendedPictographic(cp);
}

/**
 * Check if the given code point is included in Unicode \\p{Emoji_Presentation} script property
 *
 * @param {number} cp
 * @return boolean
 */
export function isEmojiPresentation(cp) {
  return bsearchRange(cp, emoji_presentation_table) >= 0;
}

/**
 * Check if the given code point is included in Unicode \\p{Extended_Pictographic} script property
 *
 * @param {number} cp
 * @return boolean
 */
export function isExtendedPictographic(cp) {
  return bsearchRange(cp, extended_pictographic_table) >= 0;
}
