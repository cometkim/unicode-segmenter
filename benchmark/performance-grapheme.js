import { group, bench, run } from 'mitata';

import Graphemer from 'graphemer';
import GraphemeSplitter from 'grapheme-splitter';

import { graphemeSegments } from '../src/grapheme.js';

let input = '👻👩‍👩‍👦‍👦';

const intlSegmenter = new Intl.Segmenter();
const graphemer = new (Graphemer.default || Graphemer)();
const graphemeSplitter = new (GraphemeSplitter.default || GraphemeSplitter)();

group(() => {
  bench('unicode-segmenter', () => {
    void ([...graphemeSegments(input)]);
  });

  bench('Intl.Segmenter', () => {
    void ([...intlSegmenter.segment(input)]);
  });

  bench('graphemer', () => {
    void ([...graphemer.iterateGraphemes(input)]);
  });

  bench('grapheme-splitter', () => {
    void ([...graphemeSplitter.iterateGraphemes(input)]);
  });
});

run();
