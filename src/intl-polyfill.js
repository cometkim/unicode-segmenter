import { Segmenter } from './intl-adapter.js';

((intl) => {
  let key = 'Segmenter';
  if (typeof intl !== 'object' || intl.hasOwnProperty(key)) {
    return;
  }
  Object.defineProperty(intl, key, {
    value: Segmenter,
    enumerable: false,
    writable: true,
    configurable: true,
  });
})(globalThis.Intl);

/* Not a pure module */
