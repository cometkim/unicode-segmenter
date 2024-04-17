/**
 * Take a UTF-8 char from the given input by cursor
 *
 * @param {string} input
 * @param {number} cursor
 * @param {number} [length] length of input
 * @return {string} a UTF-8 character (its `.length` will be 1 or 2)
 */
export function takeChar(input, cursor, length = input.length) {
  let hi = input.charCodeAt(cursor);
  if (0xd800 <= hi && hi <= 0xdbff) {
    if (cursor + 1 < length) {
      let lo = input.charCodeAt(cursor + 1);
      if (0xdc00 <= lo && lo <= 0xdfff) {
        return String.fromCodePoint(((hi - 0xd800) << 10) + (lo - 0xdc00) + 0x10000);
      }
    }
  }
  return String.fromCodePoint(hi);
}
