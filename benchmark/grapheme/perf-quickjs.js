import * as path from 'node:path';
import { build } from 'esbuild';
import { $ } from 'zx';

let baseDir = import.meta.dirname;

let libs = [
  ['unicode-segmenter/grapheme', 'bundle-entries/unicode-segmenter.js', 'perf-quickjs/unicode-segmenter.js'],
  ['graphemer', 'bundle-entries/graphemer.js', 'perf-quickjs/graphemer.js'],
  ['grapheme-splitter', 'bundle-entries/grapheme-splitter.js', 'perf-quickjs/grapheme-splitter.js'],
];

let benches = [];

for (let lib of libs) {
  let libName = lib[0];
  let libEntry = path.join(baseDir, lib[1]);
  let execEntry = path.join(baseDir, lib[2]);
  let bundleEntry = libEntry.replace(/\.js$/, '.bundle.js');

  await build({
    write: true,
    bundle: true,
    minify: true,
    format: 'esm',
    entryPoints: [libEntry],
    outfile: bundleEntry,
  });

  benches.push({
    libName,
    libEntry,
    execEntry,
    bundleEntry,
  });
}

console.log('\nExecuting QuickJS benchmark...\n');

let args = process.argv.slice(2).join(' ');

for (let bench of benches) {
  console.log(`--- ${bench.libName} ---\n`);
  await $({ stdio: 'inherit' })`qjs ${args} ${bench.execEntry}`;
}
