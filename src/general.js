// @ts-check

import { findUnicodeRangeIndex } from './core.js';
import {
  letter_ranges,
  alphabetic_ranges,
  numeric_ranges,
} from './_general_data.js';

/**
 * Check if the given code point is included in Unicode \\p{L} general property
 *
 * @param {number} cp
 * @return boolean
 */
export function isLetter(cp) {
  return findUnicodeRangeIndex(cp, letter_ranges) >= 0;
}

/**
 * Check if the given code point is included in Unicode \\p{Alphabetic} dervied property
 *
 * @param {number} cp
 * @return boolean
 */
export function isAlphabetic(cp) {
  return findUnicodeRangeIndex(cp, alphabetic_ranges) >= 0;
}

/**
 * Check if the given code point is included in Unicode \\p{N} general property
 *
 * @param {number} cp
 * @return boolean true if 
 */
export function isNumeric(cp) {
  return findUnicodeRangeIndex(cp, numeric_ranges) >= 0;
}

/**
 * @param {number} cp
 * @return boolean true
 */
export function isAlphanumeric(cp) {
  return isAlphabetic(cp) || isNumeric(cp);
}
