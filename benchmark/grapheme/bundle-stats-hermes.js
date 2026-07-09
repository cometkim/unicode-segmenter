import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import Metro from 'metro';
import { $ } from 'zx';
import { printStats, reportHermesStats, updateReadmeStats } from '../_helper.js';

let baseDir = import.meta.dirname;

let config = await Metro.loadConfig(undefined, {
  transformer: {
    enableBabelRCLookup: false,
    babelTransformerPath: '@react-native/metro-babel-transformer',
  },
  reporter: {
    update: () => { },
  },
});

let libs = [
  ['unicode-segmenter/grapheme', 'bundle-entries/unicode-segmenter.js'],
  ['unicode-segmenter/grapheme-counter', 'bundle-entries/unicode-segmenter-counter.js'],
  ['unicode-segmenter/grapheme + grapheme-counter', 'bundle-entries/unicode-segmenter-both.js'],
  ['graphemer', 'bundle-entries/graphemer.js'],
  ['grapheme-splitter', 'bundle-entries/grapheme-splitter.js'],
  ['@formatjs/intl-segmenter', 'bundle-entries/formatjs-intl-segmenter.js'],
];

let reports = [];

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

  let bin = await fs.readFile(hermesBin);

  reports.push(
    await reportHermesStats(libName, bin)
  );
}

printStats(reports);
await updateReadmeStats(reports, 'Hermes Bytecode Stats');
