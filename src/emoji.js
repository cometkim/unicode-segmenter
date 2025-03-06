// @ts-check

import { findUnicodeRangeIndex } from './core.js';
import {
  emoji_presentation_ranges,
  extended_pictographic_ranges,
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
  return findUnicodeRangeIndex(cp, emoji_presentation_ranges) >= 0;
}

/**
 * Check if the given code point is included in Unicode \\p{Extended_Pictographic} script property
 *
 * @param {number} cp
 * @return boolean
 */
export function isExtendedPictographic(cp) {
  return findUnicodeRangeIndex(cp, extended_pictographic_ranges) >= 0;
}
