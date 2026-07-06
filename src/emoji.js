// @ts-check

import { findUnicodeRangeCategory } from './core.js';
import {
  emoji_presentation_table,
  extended_pictographic_table,
} from './_emoji_data.js';

const [EMOJI_PRESENTATION_S, EMOJI_PRESENTATION_E] = emoji_presentation_table;
const [EXTENDED_PICTOGRAPHIC_S, EXTENDED_PICTOGRAPHIC_E] = extended_pictographic_table;

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
  return findUnicodeRangeCategory(cp, EMOJI_PRESENTATION_S, EMOJI_PRESENTATION_E) !== 0;
}

/**
 * Check if the given code point is included in Unicode \\p{Extended_Pictographic} script property
 *
 * @param {number} cp
 * @return boolean
 */
export function isExtendedPictographic(cp) {
  return findUnicodeRangeCategory(cp, EXTENDED_PICTOGRAPHIC_S, EXTENDED_PICTOGRAPHIC_E) !== 0;
}
