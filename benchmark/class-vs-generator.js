import { Bench } from 'tinybench';
import { graphemeSegments } from '../src/grapheme.js';
import { GraphemeSegments } from '../src/grapheme-class.js';

const bench = new Bench();

bench.add('iterate over class', () => {
  void ([...new GraphemeSegments('👻👩‍👩‍👦‍👦')]);
});

bench.add('iterate over generator', () => {
  void ([...graphemeSegments('👻👩‍👩‍👦‍👦')]);
});

await bench.warmup();
await bench.run();

console.table(bench.table());
