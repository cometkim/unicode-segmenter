import { Bench } from 'tinybench';

import Graphemer from 'graphemer';
import GraphemeSplitter from 'grapheme-splitter';
import { graphemeSegments } from 'unicode-segmenter/grapheme';

const bench = new Bench();

const intlSegmenter = new Intl.Segmenter();
const graphemer = new (Graphemer.default || Graphemer)();
const graphemeSplitter = new (GraphemeSplitter.default || GraphemeSplitter)();

bench.add('unicode-segmenter/grapheme', () => {
  void ([...graphemeSegments('👻👩‍👩‍👦‍👦')]);
});

bench.add('Intl.Segmenter', () => {
  void ([...intlSegmenter.segment('👻👩‍👩‍👦‍👦')]);
});

bench.add('graphemer', () => {
  void ([...graphemer.iterateGraphemes('👻👩‍👩‍👦‍👦')]);
});

bench.add('grapheme-splitter', () => {
  void ([...graphemeSplitter.iterateGraphemes('👻👩‍👩‍👦‍👦')]);
});

await bench.warmup();
await bench.run();

console.table(bench.table());
