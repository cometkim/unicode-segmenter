// @ts-check

import { searchUnicodeRange } from './core.js';
import {
  letter_buffer,
  alphabetic_buffer,
  numeric_buffer,
} from './_general_data.js';

/**
 * Check if the given code point is included in Unicode \\p{L} general property
 *
 * @param {number} cp
 * @return boolean
 */
export function isLetter(cp) {
  return searchUnicodeRange(cp, letter_buffer) >= 0;
}

/**
 * Check if the given code point is included in Unicode \\p{Alphabetic} dervied property
 *
 * @param {number} cp
 * @return boolean
 */
export function isAlphabetic(cp) {
  return searchUnicodeRange(cp, alphabetic_buffer) >= 0;
}

/**
 * Check if the given code point is included in Unicode \\p{N} general property
 *
 * @param {number} cp
 * @return boolean true if 
 */
export function isNumeric(cp) {
  return searchUnicodeRange(cp, numeric_buffer) >= 0;
}

/**
 * @param {number} cp
 * @return boolean true
 */
export function isAlphanumeric(cp) {
  return isAlphabetic(cp) || isNumeric(cp);
}
