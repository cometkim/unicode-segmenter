// @ts-check

import { searchUnicodeRange } from './core.js';
import {
  emoji_presentation_buffer,
  extended_pictographic_buffer,
} from './_emoji_data.js';

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
  return searchUnicodeRange(cp, emoji_presentation_buffer) >= 0;
}

/**
 * Check if the given code point is included in Unicode \\p{Extended_Pictographic} script property
 *
 * @param {number} cp
 * @return boolean
 */
export function isExtendedPictographic(cp) {
  return searchUnicodeRange(cp, extended_pictographic_buffer) >= 0;
}
