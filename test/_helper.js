// @ts-check

import { test } from 'node:test';
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

    let valArr = Array.isArray(val) ? val : [val];
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

test('_helper:assertObjectContaining', () => {
  assert.doesNotThrow(() => {
    assertObjectContaining({ foo: 'bar', ext: 'baz' }, { foo: 'bar' })
  });

  assert.doesNotThrow(() => {
    assertObjectContaining([{ foo: 'bar', ext: 'baz' }], [{ foo: 'bar' }])
  });

  assert.throws(() => {
    // @ts-expect-error
    assertObjectContaining({ foo: 'bar' }, { foo: 1 })
  });

  assert.throws(() => {
    assertObjectContaining([1, 2], [3, 4, 5])
  });

  assert.throws(() => {
    let target = { foo: 'bar' };
    let shouldThrow = new Proxy(target, {
      get() {
        throw new Error();
      },
    });
    assertObjectContaining(target, shouldThrow);
  });

  assert.throws(() => {
    let target = { foo: 'bar' };
    let shouldFail = new Proxy(target, {
      get() {
        assert.fail();
      },
    });
    assertObjectContaining(target, shouldFail);
  });
});
