// @ts-check

import * as assert from 'node:assert/strict';

/**
 * @template {object} T
 * @template {T} U
 * @param {U} val
 * @param {T} exp
 * @param {string | Error} [msg]
 */
export function assertObjectContaining(val, exp, msg) {
  let inv = Symbol('inv');
  try {
    if (Array.isArray(val) !== Array.isArray(exp)) throw inv;

    let valArr = Array.isArray(exp) ? exp : [exp];
    let expArr = Array.isArray(exp) ? exp : [exp];
    if (valArr.length !== expArr.length) throw inv;

    for (let i = 0; i < expArr.length; i++) {
      let val = valArr[i];
      let exp = expArr[i];
      /** @type {Record<string, unknown>} */
      let subset = {};
      for (let key of Object.keys(exp)) {
        if (typeof exp[key] !== typeof val[key]) throw inv;
        subset[key] = val[key];
      }
      assert.deepEqual(subset, exp);
    }
  } catch (err) {
    if (err === inv || err instanceof assert.AssertionError) {
      assert.deepEqual(val, exp, msg);
    } else {
      throw err;
    }
  }
}
