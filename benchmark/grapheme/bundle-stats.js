// @ts-check

import * as path from 'node:path';
import { build } from 'esbuild';
import { getBinary as getBinary_unicode_segmentation } from 'unicode-segmentation-wasm/wasm';

import { reportBundleStats, reportWasmBindingStats } from '../_helper.js';

let baseDir = import.meta.dirname;

let libs = [
  ['unicode-segmenter/grapheme', 'bundle-entries/unicode-segmenter.js'],
  ['graphemer', 'bundle-entries/graphemer.js'],
  ['grapheme-splitter', 'bundle-entries/grapheme-splitter.js'],
  ['@formatjs/intl-segmenter', 'bundle-entries/formatjs-intl-segmenter.js'],
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

{
  let libName = 'unicode-segmentation (wasm-bindgen)';
  let bindingEntry = path.join(baseDir, 'bundle-entries/unicode-segmentation.js');
  let bindingResult = await build({
    write: false,
    bundle: true,
    entryPoints: [bindingEntry],
    platform: 'node',
  });
  let bindingMinResult = await build({
    write: false,
    bundle: true,
    minify: true,
    entryPoints: [bindingEntry],
    platform: 'node',
  });
  let bindingReport = await reportWasmBindingStats(
    libName,
    bindingResult.outputFiles[0].contents,
    bindingMinResult.outputFiles[0].contents,
    await getBinary_unicode_segmentation(),
  );
  reports.push(bindingReport);
}

console.table(reports);
