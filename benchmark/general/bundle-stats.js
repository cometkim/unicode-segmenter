// @ts-check

import * as path from 'node:path';
import { build } from 'esbuild';

import { reportBundleStats } from '../_helper.js';

let baseDir = import.meta.dirname;

let libs = [
  ['unicode-segmenter/general', 'bundle-entries/unicode-segmenter.js'],
  ['xregexp', 'bundle-entries/xregexp.js'],
];

let reports = await Promise.all(
  libs.map(async (lib) => {
    let libName = lib[0];
    let libEntry = path.join(baseDir, lib[1]);
    let result = await build({
      write: false,
      bundle: true,
      entryPoints: [libEntry],
    });
    let minResult = await build({
      write: false,
      bundle: true,
      minify: true,
      entryPoints: [libEntry],
    });
    return await reportBundleStats(
      libName,
      result.outputFiles[0].contents,
      minResult.outputFiles[0].contents,
    );
  }),
);

console.table(reports);