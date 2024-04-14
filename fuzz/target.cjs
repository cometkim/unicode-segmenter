const { graphemeSegments } = require('../grapheme.cjs');

/**
 * @param {Buffer} data
 */
module.exports.fuzz = (data) => {
  let fuzzerData = data.toString();
  void [...graphemeSegments(fuzzerData)];
};
