import * as path from 'node:path';
import { build } from 'esbuild';
import { $ } from 'zx';

let baseDir = import.meta.dirname;

let libs = [
  ['unicode-segmenter/grapheme', 'perf-porffor/unicode-segmenter.js'],
  ['graphemer', 'perf-porffor/graphemer.js'],
  ['grapheme-splitter', 'perf-porffor/grapheme-splitter.js'],
];

let benches = [];

for (let lib of libs) {
  let libName = lib[0];
  let libEntry = path.join(baseDir, lib[1]);

  let bundleEntry = libEntry.replace(/\.js$/, '.bundle.js');

  await build({
    write: true,
    bundle: true,
    format: 'esm',
    entryPoints: [libEntry],
    outfile: bundleEntry,
  });

  benches.push({
    libName,
    libEntry,
    bundleEntry,
  });
}

console.log('\nExecuting Porffor benchmark...\n');

for (let bench of benches) {
  console.log(`--- ${bench.libName} ---\n`);
  await $({ stdio: 'inherit' })`yarn porf ${bench.bundleEntry}`;
}
