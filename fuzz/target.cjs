const assert = require('node:assert/strict');
const { Segmenter } = require('unicode-segmenter/intl-adapter');

let segmenter = new Segmenter();
let intlSegmenter = new Intl.Segmenter();

/**
 * @param {Buffer} data
 */
module.exports.fuzz = (data) => {
  let fuzzerData = data.toString();
  void assert.deepEqual(
    [...segmenter.segment(fuzzerData)],
    [...intlSegmenter.segment(fuzzerData)],
  );
};
