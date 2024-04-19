// @ts-check

import { bsearchRange } from './core.js';
import {
  letter_table,
  alphabetic_table,
  numeric_table,
} from './_general_table.js';

/**
 * Check if the given code point is included in Unicode \\p{L} general property
 *
 * @param {number} cp
 * @return boolean
 */
export function isLetter(cp) {
  return bsearchRange(cp, letter_table) >= 0;
}

/**
 * Check if the given code point is included in Unicode \\p{Alphabetic} dervied property
 *
 * @param {number} cp
 * @return boolean
 */
export function isAlphabetic(cp) {
  return bsearchRange(cp, alphabetic_table) >= 0;
}

/**
 * Check if the given code point is included in Unicode \\p{N} general property
 *
 * @param {number} cp
 * @return boolean true if 
 */
export function isNumeric(cp) {
  return bsearchRange(cp, numeric_table) >= 0;
}

/**
 * @param {number} cp
 * @return boolean true
 */
export function isAlphanumeric(cp) {
  return isAlphabetic(cp) || isNumeric(cp);
}
