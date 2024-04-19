// @ts-check

import { bsearchRange } from './core.js';
import {
  emoji_table,
  emoji_presentation_table,
} from './_emoji_table.js';

/**
 * Check if the given code point is included in Unicode \\p{Extended_Pictographic} script property
 *
 * @param {number} cp
 * @return boolean
 */
export function isEmoji(cp) {
  return bsearchRange(cp, emoji_table) >= 0;
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
