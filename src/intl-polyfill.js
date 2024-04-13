import { Segmenter } from './intl-adapter.js';

((intl) => {
  if (typeof intl !== 'object') {
    return;
  }
  intl.Segmenter ||= Segmenter;
})(globalThis.Intl);

/*  Not a pure module */
