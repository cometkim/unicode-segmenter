// Importing both entries shares `grapheme-core.js`; the counter adds
// only its counting loop on top of the segmenter.
export {
  graphemeSegments,
  splitGraphemes,
  countGraphemes,
} from '../../../src/grapheme.js';
export {
  countGraphemes as countGraphemesFast,
} from '../../../src/grapheme-counter.js';
