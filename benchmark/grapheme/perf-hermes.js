import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import Metro from 'metro';
import { $ } from 'zx';

let baseDir = import.meta.dirname;

let config = await Metro.loadConfig(undefined, {
  transformer: {
    enableBabelRCLookup: false,
    babelTransformerPath: '@react-native/metro-babel-transformer',
  },
  reporter: {
    update: () => {},
  },
});

let libs = [
  ['unicode-segmenter/grapheme', 'hermes-perf/unicode-segmenter.js'],
  ['graphemer', 'hermes-perf/graphemer.js'],
  ['grapheme-splitter', 'hermes-perf/grapheme-splitter.js'],

  // Unmet `Intl` dependencies
  // ['@formatjs/intl-segmenter', 'hermes-perf/formatjs-intl-segmenter.js'],
];

let benches = [];

for (let lib of libs) {
  let libName = lib[0];
  let libEntry = path.join(baseDir, lib[1]);

  let hermesEntry = libEntry.replace(/\.js$/, '.hermes.js');
  let hermesBin = libEntry.replace(/\.js$/, '.hermes.hbc');

  await Metro.runBuild(config, {
    entry: libEntry,
    out: hermesEntry,
    dev: false,
  });

  await $`hermes -emit-binary -out ${hermesBin} ${hermesEntry}`;

  benches.push({
    libName,
    hermesBin,
  });
}

console.log('\nExecuting Hermes bytecodes...\n');

for (let bench of benches) {
  await $({ stdio: 'inherit' })`hermes ${bench.hermesBin}`;
  console.log();
}
