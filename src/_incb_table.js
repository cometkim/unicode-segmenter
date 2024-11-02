// The following code was generated by "scripts/unicode.js",
// DO NOT EDIT DIRECTLY.
//
// @ts-check

/**
 * The Unicode `Indic_Conjunct_Break=Consonant` derived property table
 */
const consonant_str = '1sl,10,1ug,7,1vc,7,1w5,j,1wq,6,1wy,,1x2,3,1y4,1,1y7,,1yo,1,239,j,23u,6,242,1,245,4,261,,26t,j,27e,6,27m,1,27p,4,28s,1,28v,,29d,,2dx,j,2ei,f,2fs,2,2l1,11';

export const consonant_table = new Uint16Array(52);
(function(table, value) {
  let nums = value.split(',').map(s => s ? parseInt(s, 36) : 0);
  for (let i = 0, n = 0; i < nums.length; i++)
    table[i] = i % 2 ? n + nums[i] : (n = nums[i]);
})(consonant_table, consonant_str);

