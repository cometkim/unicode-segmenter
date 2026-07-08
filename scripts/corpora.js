#!/usr/bin/env node

// Fetches real-world text corpora and writes them to `test/_corpora/`,
// consumed by `test/corpora.js`.
//
// The official GraphemeBreakTest.txt exercises only short synthetic
// sequences, and randomized property tests rarely produce patterns like
// conjunct-suppressing ZWNJ or cross-cluster state interactions.
// Natural texts caught real bugs that both had missed.
// See https://github.com/cometkim/unicode-segmenter/issues/124
//
// Sources:
// - UDHR translations from the "UDHR in Unicode" project data, pinned to
//   a commit of https://github.com/eric-muller/udhr (the project left
//   unicode.org hosting in 2024). The UDHR is a United Nations document
//   in the public domain.
// - Public-domain literature from Wikisource, including the exact texts
//   reported in issue #124.
// - Every emoji sequence from the UCD emoji-test.txt, concatenated.

// @ts-check

import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import { existsSync } from 'node:fs';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

let __dirname = path.dirname(fileURLToPath(import.meta.url));
let cachePath = path.resolve(__dirname, 'corpora_data');
let outPath = path.resolve(__dirname, '../test/_corpora');

// Keep in sync with `scripts/unicode.js`
const UNICODE_VERSION_STRING = '17.0.0';

const UDHR_COMMIT = 'f93dd614154c47fc4b85ec03d8d6f1abe97869ef';

const USER_AGENT = 'unicode-segmenter-corpora (https://github.com/cometkim/unicode-segmenter)';

/**
 * `data/udhr/udhr_{key}.xml` in the UDHR repository.
 *
 * Picked for break-property coverage: Indic scripts with InCB
 * conjuncts, SE Asian scripts with stacked clusters, Hangul syllables,
 * CJK, RTL scripts with ZWNJ, and combining-mark-heavy Latin.
 *
 * @type {Array<[key: string, name: string]>}
 */
let udhrEntries = [
  ['amh', 'Amharic (Ethiopic)'],
  ['arb', 'Standard Arabic'],
  ['ben', 'Bengali'],
  ['cmn_hans', 'Mandarin Chinese (Simplified)'],
  ['eng', 'English'],
  ['guj', 'Gujarati'],
  ['hin', 'Hindi (Devanagari)'],
  ['jpn', 'Japanese'],
  ['kan', 'Kannada'],
  ['khm', 'Khmer'],
  ['kor', 'Korean (Hangul)'],
  ['lao', 'Lao'],
  ['mal', 'Malayalam'],
  ['mal_chillus', 'Malayalam (chillu variant)'],
  ['mar', 'Marathi (Devanagari)'],
  ['mya', 'Burmese (Myanmar)'],
  ['pan', 'Punjabi (Gurmukhi)'],
  ['pes_1', 'Iranian Persian'],
  ['sin', 'Sinhala'],
  ['tam', 'Tamil'],
  ['tel', 'Telugu'],
  ['tha', 'Thai'],
  ['vie', 'Vietnamese'],
];

/**
 * Public-domain literature hosted by Wikisource; these are the texts
 * that originally reported divergences in issue #124. Odia has no UDHR
 * translation in the dataset, so Wikisource is its only entry.
 *
 * @type {Array<{ host: string, title: string, out: string, note: string }>}
 */
let wikisourceEntries = [
  {
    host: 'ml.wikisource.org',
    title: 'വാസനാവികൃതി',
    out: 'wikisource_mal_vasanavikruthi',
    note: 'Vasanavikruthi — Vengayil Kunhiraman Nayanar (1891)',
  },
  {
    host: 'ml.wikisource.org',
    title: 'കഴുതയുടെ_വാക്കുകേട്ട_കാളയുടെ_കഥ',
    out: 'wikisource_mal_kazhuthayude',
    note: 'Kazhuthayude Vakkuketta Kaalayude Katha — Malayalam prose',
  },
  {
    host: 'or.wikisource.org',
    title: 'ଛମାଣ_ଆଠଗୁଣ୍ଠ/ରାମଚନ୍ଦ୍ର_ମଙ୍ଗରାଜ',
    out: 'wikisource_ory_chhamana',
    note: 'Chha Mana Atha Guntha ch. 1 — Fakir Mohan Senapati (1897)',
  },
];

/**
 * @param {string} name cache file name
 * @param {string} url
 * @return {Promise<string>}
 */
let fetchData = async (name, url) => {
  let filePath = path.join(cachePath, name);
  if (!existsSync(filePath)) {
    console.log(`fetching ${url}`);
    let res = await fetch(url, { headers: { 'user-agent': USER_AGENT } });
    assert.ok(res.ok, `failed to fetch ${url}: ${res.status}`);
    let content = await res.text();
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  }
  return fs.readFile(filePath, 'utf-8');
};

/**
 * @param {string} text
 * @return {string}
 */
let decodeEntities = text => text
  .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
  .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(+dec))
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, '\'')
  .replace(/&amp;/g, '&');

/**
 * Removes tags without tripping over `<`/`>` inside quoted attribute
 * values (Parsoid embeds JSON in `data-mw` attributes).
 *
 * @param {string} html
 * @return {string}
 */
let stripTags = html => html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<[^>"']*(?:"[^"]*"[^>"']*|'[^']*'[^>"']*)*>/g, '');

/**
 * Text content of `title` and `para` elements, in document order.
 *
 * @param {string} xml
 * @return {string}
 */
let extractUdhrText = xml => {
  let out = [];
  for (let [, , inner] of xml.matchAll(/<(title|para)\b[^>]*>([\s\S]*?)<\/\1>/g)) {
    let text = decodeEntities(stripTags(inner)).trim();
    if (text) out.push(text);
  }
  return out.join('\n');
};

/**
 * Text content of paragraph elements only; drops navigation chrome,
 * headers, and proofread-page templates around them.
 *
 * @param {string} html
 * @return {string}
 */
let extractWikisourceText = html => {
  let out = [];
  for (let [, inner] of html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)) {
    let text = decodeEntities(stripTags(inner)).replace(/[ \t]+/g, ' ').trim();
    if (text) out.push(text);
  }
  return out.join('\n');
};

/**
 * Every sequence listed in emoji-test.txt, including non-RGI
 * minimally-qualified/unqualified forms and bare components.
 *
 * @param {string} src
 * @return {string[]}
 */
let parseEmojiSequences = src => {
  let out = [];
  for (let line of src.split('\n')) {
    let match = line.match(/^([0-9A-F ]+?)\s*;\s*(?:fully-qualified|minimally-qualified|unqualified|component)/);
    if (!match) continue;
    out.push(String.fromCodePoint(...match[1].trim().split(/\s+/).map(hex => parseInt(hex, 16))));
  }
  return out;
};

/**
 * @typedef {object} Corpus
 * @property {string} file
 * @property {string} title
 * @property {string} source
 * @property {string} license
 * @property {string} text
 */

/** @type {Corpus[]} */
let corpora = [];

for (let [key, name] of udhrEntries) {
  let xml = await fetchData(
    `udhr/udhr_${key}.xml`,
    `https://raw.githubusercontent.com/eric-muller/udhr/${UDHR_COMMIT}/data/udhr/udhr_${key}.xml`,
  );
  let text = extractUdhrText(xml);
  // A complete UDHR translation runs ~3,000 chars even in terse
  // CJK scripts; anything below that is a truncated download.
  assert.ok(text.length > 2500, `udhr_${key}: extracted only ${text.length} chars`);
  corpora.push({
    file: `udhr_${key}.txt`,
    title: `Universal Declaration of Human Rights — ${name}`,
    source: `https://github.com/eric-muller/udhr/blob/${UDHR_COMMIT}/data/udhr/udhr_${key}.xml`,
    license: 'United Nations document, in the public domain',
    text,
  });
}

for (let entry of wikisourceEntries) {
  let api = `https://${entry.host}/w/rest.php/v1/page/${encodeURIComponent(entry.title)}`;
  let meta = JSON.parse(await fetchData(`wikisource/${entry.out}.meta.json`, api));
  let html = await fetchData(`wikisource/${entry.out}.html`, `${api}/html`);
  let text = extractWikisourceText(html);
  assert.ok(text.length > 3000, `${entry.out}: extracted only ${text.length} chars`);
  corpora.push({
    file: `${entry.out}.txt`,
    title: `${entry.note}, from issue #124`,
    source: `https://${entry.host}/wiki/${entry.title} (revision ${meta.latest.id})`,
    license: 'Public-domain text, hosted by Wikisource',
    text,
  });
}

{
  let src = await fetchData(
    'emoji/emoji-test.txt',
    `https://www.unicode.org/Public/${UNICODE_VERSION_STRING}/emoji/emoji-test.txt`,
  );
  let sequences = parseEmojiSequences(src);
  assert.ok(sequences.length > 3000, `emoji-test: parsed only ${sequences.length} sequences`);
  corpora.push({
    file: 'emoji_test_sequences.txt',
    title: `All ${sequences.length} emoji-test.txt sequences, concatenated without separators`,
    source: `https://www.unicode.org/Public/${UNICODE_VERSION_STRING}/emoji/emoji-test.txt`,
    license: 'Unicode License v3, https://www.unicode.org/license.txt',
    text: sequences.join(''),
  });
}

/**
 * @param {string} text
 * @param {RegExp} re
 * @return {number}
 */
let countMatches = (text, re) => text.match(re)?.length ?? 0;

/**
 * @param {string} text
 */
let statsOf = text => ({
  points: [...text].length,
  zwnj: countMatches(text, /\u200C/g),
  zwj: countMatches(text, /\u200D/g),
  virama: countMatches(
    text,
    /[\u094D\u09CD\u0A4D\u0ACD\u0B4D\u0BCD\u0C4D\u0CCD\u0D4D\u0DCA\u1039\u103A\u17D2]/g,
  ),
  marks: countMatches(text, /\p{M}/gu),
  pict: countMatches(text, /\p{Extended_Pictographic}/gu),
});

await fs.mkdir(outPath, { recursive: true });
for (let stale of await fs.readdir(outPath)) {
  if (stale.endsWith('.txt') || stale === 'README.md') {
    await fs.rm(path.join(outPath, stale));
  }
}

for (let corpus of corpora) {
  let header = [
    `# ${corpus.file} — ${corpus.title}`,
    `# Source: ${corpus.source}`,
    `# License: ${corpus.license}`,
    '# Generated by scripts/corpora.js — DO NOT EDIT',
  ].join('\n');
  await fs.writeFile(path.join(outPath, corpus.file), `${header}\n\n${corpus.text}\n`, 'utf-8');
}

let statsRows = corpora.map(corpus => {
  let stats = statsOf(corpus.text);
  return `| ${corpus.file} | ${stats.points} | ${stats.zwnj} | ${stats.zwj} | ${stats.virama} | ${stats.marks} | ${stats.pict} |`;
});

let readme = `# Test corpora

Real-world text fixtures for \`test/corpora.js\`, which cross-checks
\`graphemeSegments()\` against \`Intl.Segmenter\` over natural texts.

Synthetic tests cannot represent everything: the official
GraphemeBreakTest.txt covers only short sequences, and randomized
property tests rarely generate patterns like conjunct-suppressing ZWNJ
or cross-cluster state interactions. Natural corpora caught real bugs
that both had missed — see [issue #124].

Each fixture carries its own provenance header, which is segmented
along with the body (it's plain ASCII, so it adds trivial coverage).

Generated by \`node scripts/corpora.js\` — DO NOT EDIT. Downloads are
cached under \`scripts/corpora_data/\`; delete it to re-fetch.

[issue #124]: https://github.com/cometkim/unicode-segmenter/issues/124

| fixture | code points | ZWNJ | ZWJ | virama | marks | pictographic |
|---|---|---|---|---|---|---|
${statsRows.join('\n')}

## Sources

${corpora.map(corpus => `- \`${corpus.file}\` — ${corpus.title}\n  - Source: ${corpus.source}\n  - License: ${corpus.license}`).join('\n')}
`;

await fs.writeFile(path.join(outPath, 'README.md'), readme, 'utf-8');

console.log(`\n${corpora.length} corpus fixtures written to ${path.relative(process.cwd(), outPath)}\n`);
console.log('fixture'.padEnd(42), 'points'.padStart(7), 'ZWNJ'.padStart(6), 'ZWJ'.padStart(6), 'virama'.padStart(7), 'marks'.padStart(7), 'pict'.padStart(6));
for (let corpus of corpora) {
  let stats = statsOf(corpus.text);
  console.log(
    corpus.file.padEnd(42),
    String(stats.points).padStart(7),
    String(stats.zwnj).padStart(6),
    String(stats.zwj).padStart(6),
    String(stats.virama).padStart(7),
    String(stats.marks).padStart(7),
    String(stats.pict).padStart(6),
  );
}
