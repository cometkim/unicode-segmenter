const { graphemeSegments } = require('../grapheme.cjs');

/**
 * @param {Buffer} data
 */
module.exports.fuzz = (data) => {
	const fuzzerData = data.toString();
	void [...graphemeSegments(fuzzerData)];
};
