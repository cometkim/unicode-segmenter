// @ts-check

import { findUnicodeRangeCategory } from './core.js';
import {
  letter_table,
  alphabetic_table,
  numeric_table,
} from './_general_data.js';

const [LETTER_S, LETTER_E] = letter_table;
const [ALPHABETIC_S, ALPHABETIC_E] = alphabetic_table;
const [NUMERIC_S, NUMERIC_E] = numeric_table;

/**
 * Check if the given code point is included in Unicode \\p{L} general property
 *
 * @param {number} cp
 * @return boolean
 */
export function isLetter(cp) {
  return findUnicodeRangeCategory(cp, LETTER_S, LETTER_E) !== 0;
}

/**
 * Check if the given code point is included in Unicode \\p{Alphabetic} dervied property
 *
 * @param {number} cp
 * @return boolean
 */
export function isAlphabetic(cp) {
  return findUnicodeRangeCategory(cp, ALPHABETIC_S, ALPHABETIC_E) !== 0;
}

/**
 * Check if the given code point is included in Unicode \\p{N} general property
 *
 * @param {number} cp
 * @return boolean true if
 */
export function isNumeric(cp) {
  return findUnicodeRangeCategory(cp, NUMERIC_S, NUMERIC_E) !== 0;
}

/**
 * @param {number} cp
 * @return boolean true
 */
export function isAlphanumeric(cp) {
  return isAlphabetic(cp) || isNumeric(cp);
}
