import * as fs from 'node:fs/promises';
import * as zlib from 'node:zlib';
import { promisify } from 'node:util';

import prettyBytes from 'pretty-bytes';

let gzip = promisify(zlib.gzip);
let brotli = promisify(zlib.brotliCompress);
let zstd = promisify(zlib.zstdCompress);

function byteLength(bytes, pretty = process.env.PRETTY === 'true') {
  let len = bytes;
  if (bytes instanceof Uint8Array) {
    len = bytes.byteLength;
  }
  return pretty ? prettyBytes(len) : len;
}

export async function reportBundleStats(name, bundle, minBundle) {
  return {
    name,
    'Size': byteLength(bundle),
    'Size (min)': byteLength(minBundle),
    'Size (min+gzip)': byteLength(await gzip(minBundle)),
    'Size (min+br)': byteLength(await brotli(minBundle)),
    'Size (min+zstd)': byteLength(await zstd(minBundle)),
  };
}

export async function reportWasmBindingStats(name, bundle, minBundle, wasm) {
  return {
    name,
    'Size': byteLength(bundle.byteLength + wasm.byteLength),
    'Size (min)': byteLength(minBundle.byteLength + wasm.byteLength),
    'Size (min+gzip)': byteLength((await gzip(minBundle)).byteLength + (await gzip(wasm)).byteLength),
    'Size (min+br)': byteLength((await brotli(minBundle)).byteLength + (await brotli(wasm)).byteLength),
    'Size (min+zstd)': byteLength((await zstd(minBundle)).byteLength + (await zstd(wasm)).byteLength),
  };
}

export async function reportHermesStats(name, bin) {
  return {
    name,
    'Bytecode size': byteLength(bin),
    'Bytecode size (gzip)': byteLength(await gzip(bin)),
  };
}

/**
 * Print stat reports as a table.
 *
 * Defaults to `console.table`; set `PRINT_FORMAT=markdown` to emit a
 * README-ready markdown table instead (names in backticks, numbers
 * comma-formatted and right-aligned).
 */
export function printStats(reports) {
  if (process.env.PRINT_FORMAT !== 'markdown') {
    console.table(reports);
    return;
  }

  let columns = [];
  for (let report of reports) {
    for (let key of Object.keys(report)) {
      if (!columns.includes(key)) columns.push(key);
    }
  }

  let rows = reports.map(report => columns.map((key, i) => {
    let value = report[key];
    if (value == null) return '';
    if (typeof value === 'number') return value.toLocaleString('en-US');
    return i === 0 ? `\`${value}\`` : String(value);
  }));

  let widths = columns.map((key, i) => {
    return Math.max(key.length, ...rows.map(row => row[i].length));
  });

  let lines = [
    `| ${columns.map((key, i) => key.padEnd(widths[i])).join(' | ')} |`,
    `|${widths.map((w, i) => i === 0 ? '-'.repeat(w + 2) : `${'-'.repeat(w + 1)}:`).join('|')}|`,
    ...rows.map(row => {
      return `| ${row.map((cell, i) => i === 0 ? cell.padEnd(widths[i]) : cell.padStart(widths[i])).join(' | ')} |`;
    }),
  ];
  console.log(lines.join('\n'));
}

/**
 * Update a stats table in README.md with fresh report values, when
 * `UPDATE_README=true`.
 *
 * The table is located by its `#### <section>` heading. Rows are
 * matched by library name and columns by header text, both ignoring
 * the `*` footnote marks, which are preserved as-is. Cells with no
 * matching report column (e.g. Unicode®, ESM?) and rows with no
 * matching report (e.g. `Intl.Segmenter`) are left untouched.
 *
 * @param {Array<Record<string, unknown>>} reports
 * @param {string} section heading text, e.g. 'JS Bundle Stats'
 */
export async function updateReadmeStats(reports, section) {
  if (process.env.UPDATE_README !== 'true') return;

  let readmeUrl = new URL('../README.md', import.meta.url);
  let source = await fs.readFile(readmeUrl, 'utf-8');
  let lines = source.split('\n');

  let headingPattern = new RegExp(
    `^#{1,6}\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`,
  );
  let heading = lines.findIndex(line => headingPattern.test(line));
  let head = heading < 0
    ? -1
    : lines.findIndex((line, i) => i > heading && line.trimStart().startsWith('|'));
  if (head < 0) {
    console.warn(`README: no "${section}" table found, skipped`);
    return;
  }
  let end = head + 1;
  while (end < lines.length && lines[end].trimStart().startsWith('|')) end += 1;

  let split = line => line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
  let stripMark = text => text.replace(/\*+$/, '').trim();

  let header = split(lines[head]);
  let aligns = split(lines[head + 1]).map(cell => {
    return cell.endsWith(':') ? (cell.startsWith(':') ? 'center' : 'right') : 'left';
  });
  let body = lines.slice(head + 2, end).map(split);
  let colKeys = header.map(stripMark);

  let byName = new Map(reports.map(report => [String(report.name), report]));
  for (let report of reports) {
    // e.g. the 'unicode-segmentation (wasm-bindgen)' report matches
    // the `unicode-segmentation` row
    let alias = String(report.name).replace(/\s*\([^)]*\)$/, '');
    if (!byName.has(alias)) byName.set(alias, report);
  }

  let matched = new Set();
  for (let row of body) {
    let report = byName.get(stripMark(row[0]).replace(/`/g, '').trim());
    if (!report) continue;
    matched.add(report);
    for (let i = 1; i < header.length; i++) {
      let value = report[colKeys[i]];
      if (value === undefined) continue;
      row[i] = typeof value === 'number' ? value.toLocaleString('en-US') : String(value);
    }
  }
  for (let report of reports) {
    if (!matched.has(report)) {
      console.warn(`README: no "${section}" row for '${report.name}'; add it manually`);
    }
  }

  let widths = header.map((cell, i) => {
    return Math.max(cell.length, 3, ...body.map(row => (row[i] ?? '').length));
  });
  let pad = (cell, i) => aligns[i] === 'right' ? cell.padStart(widths[i]) : cell.padEnd(widths[i]);
  let render = row => `| ${header.map((_, i) => pad(row[i] ?? '', i)).join(' | ')} |`;
  let separator = `|${widths.map((w, i) => {
    if (aligns[i] === 'right') return `${'-'.repeat(w + 1)}:`;
    if (aligns[i] === 'center') return `:${'-'.repeat(w)}:`;
    return '-'.repeat(w + 2);
  }).join('|')}|`;

  let next = [
    ...lines.slice(0, head),
    render(header),
    separator,
    ...body.map(render),
    ...lines.slice(end),
  ].join('\n');

  if (next === source) {
    console.log(`README: "${section}" table is up to date`);
    return;
  }
  await fs.writeFile(readmeUrl, next);
  console.log(`README: updated "${section}" table`);
}
