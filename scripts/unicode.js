#!/usr/bin/env node

// Copyright 2011-2015 The Rust Project Developers. See the COPYRIGHT
// file at the top-level directory of this distribution and at
// http://rust-lang.org/COPYRIGHT.
// 
// This script has been modified from
// [https://github.com/unicode-rs/unicode-segmentation/blob/b4c9ce15/scripts/unicode.py]
// 
// Which is licensed under the
// [MIT license](../licenses/unicode-segmentation_MIT.txt)
// 
// This script uses the following Unicode tables:
// - DerivedCoreProperties.txt
// - auxiliary/GraphemeBreakProperty.txt
// - auxiliary/GraphemeBreakTest.txt
// - auxiliary/WordBreakProperty.txt
// - auxiliary/WordBreakTest.txt
// - ReadMe.txt
// - UnicodeData.txt

// @ts-check

/**
 * @import { WriteStream } from 'node:fs';
 * @import { UnicodeRange, CategorizedUnicodeRange } from '../src/core.js';
 * 
 * @typedef {number[]} UnicodeValues
 */

import * as assert from 'node:assert/strict';
import * as path from 'node:path';
import { existsSync, createWriteStream } from 'node:fs';
import * as fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { isBMP } from '../src/utils.js';

let __dirname = path.dirname(fileURLToPath(import.meta.url));
let srcPath = path.resolve(__dirname, '../src');
let testPath = path.resolve(__dirname, '../test');
let dataPath = path.resolve(__dirname, 'unicode_data');

let preamble = `
// The following code was generated by "scripts/unicode.js",
// DO NOT EDIT DIRECTLY.
//
// @ts-check
`.trimStart();

/** @type {[major: number, minor: number, patch: number]} */
const UNICODE_VERSION = [16, 0, 0];
const UNICODE_VERSION_STRING = UNICODE_VERSION.join('.');

// these are the surrogate codepoints, which are not valid rust characters
/** @type {UnicodeRange} */
let surrogateCodepoints = [0xd800, 0xdfff];

/** @type {Record<string, string[]>} */
let expandedCategories = {
  'Lu': ['LC', 'L'], 'Ll': ['LC', 'L'], 'Lt': ['LC', 'L'],
  'Lm': ['L'], 'Lo': ['L'],
  'Mn': ['M'], 'Mc': ['M'], 'Me': ['M'],
  'Nd': ['N'], 'Nl': ['N'], 'No': ['N'],
  'Pc': ['P'], 'Pd': ['P'], 'Ps': ['P'], 'Pe': ['P'],
  'Pi': ['P'], 'Pf': ['P'], 'Po': ['P'],
  'Sm': ['S'], 'Sc': ['S'], 'Sk': ['S'], 'So': ['S'],
  'Zs': ['Z'], 'Zl': ['Z'], 'Zp': ['Z'],
  'Cc': ['C'], 'Cf': ['C'], 'Cs': ['C'], 'Co': ['C'], 'Cn': ['C'],
};

/**
 * @param {string} f
 * @return {Promise<string>}
 */
let fetchData = async f => {
  let url = new URL(`https://www.unicode.org/Public/${UNICODE_VERSION_STRING}/ucd/${f}`);
  let filePath = path.join(dataPath, f);

  let content = null;
  if (existsSync(filePath)) {
    content = await fs.readFile(filePath, 'utf-8');
  } else {
    let res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }
    content = await res.text();
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
  }

  return content;
};

/**
 * @template T
 * @param {T[]} a 
 * @param {T[]} b 
 */
let arraysEqual = (a, b) => {
  return a.length === b.length && a.every((v, i) => v === b[i]);
};

/**
 * @param {number} from 
 * @param {number} to 
 * @return {Iterable<number>}
 */
let range = (from, to) => {
  return Array.from({ length: to - from }, (_, i) => i + from);
};

/**
 * @param {string} str 
 * @return {string}
 */
let capitalize = str => {
  return str[0].toUpperCase() + str.slice(1);
};

/**
 * @param {number} c 
 * @return {string}
 */
let escapeUnicode = c => {
  return `\\u{${c.toString(16).padStart(4, '0')}}`;
};

/**
 * @param {number} n
 * @return {boolean}
 */
let isSurrogate = n => {
  return surrogateCodepoints[0] <= n && n <= surrogateCodepoints[1];
};

/**
 * @template T
 * @param {Set<T>} a 
 * @param {Set<T>} b 
 * @return {Set<T>}
 */
let difference = (a, b) => {
  const result = new Set(a);
  if (a.size <= b.size) {
    for (const elem of a) {
      if (b.has(elem)) {
        result.delete(elem);
      }
    }
  } else {
    for (const elem of b.keys()) {
      if (result.has(elem)) {
        result.delete(elem);
      }
    }
  }
  return result;
};

/**
 * @param {UnicodeRange} range
 * @param {boolean} [compressed=true]
 * @return {string}
 */
let formatRange = (range, compressed = true) => {
  return compressed
    ? `[${range[0]},${range[1]}]`
    : `[${range[0]}, ${range[1]}]`
};

/**
 * @param {UnicodeRange[]} ranges
 * @return {UnicodeValues}
 */
let ungroupCat = ranges => {
  /** @type {UnicodeValues} */
  let catOut = [];
  for (let [point, padding] of ranges) {
    let cur = point;
    while (cur <= point + padding) {
      catOut.push(cur);
      cur += 1;
    }
  }
  return catOut;
};

/**
 * @param {UnicodeValues} values
 * @return {UnicodeRange[]}
 */
let groupCat = values => {
  /** @type {UnicodeRange[]} */
  let catOut = [];
  let letters = [...new Set(values)].toSorted((a, b) => a - b);

  let curStart = letters.shift();
  assert.ok(curStart != null);

  let curEnd = curStart;
  for (let letter of letters) {
    assert.ok(letter > curEnd, `curEnd: ${curEnd}, letter: ${letter}`);

    if (letter === curEnd + 1) {
      curEnd = letter;
    } else {
      catOut.push([curStart, curEnd - curStart]);
      curStart = curEnd = letter;
    }
  }
  catOut.push([curStart, curEnd - curStart]);
  return catOut;
};

/**
 * @param {Record<string, UnicodeValues>} cats 
 * @return {Record<string, UnicodeRange[]>}
 */
let groupCats = cats => {
  /** @type {Record<string, UnicodeRange[]>} */
  let catsOut = {};
  for (let [cat, codes] of Object.entries(cats)) {
    catsOut[cat] = groupCat(codes);
  }
  return catsOut;
};

/**
 * @param {string} data
 * @return {Record<string, UnicodeRange[]>}
 */
let parseGencats = (data) => {
  /** @type {Record<string, UnicodeValues>} */
  let gencats = {};

  /** @type {Record<number, string[]>} */
  let udict = {};
  let rangeStart = -1;

  for (let line of data.split('\n')) {
    let data = line.split(';');
    if (data.length !== 15) {
      continue;
    }
    let cp = Number.parseInt(data[0], 16);
    if (isSurrogate(cp)) {
      continue;
    }
    if (rangeStart >= 0) {
      for (let i of range(rangeStart, cp)) {
        udict[i] = data;
      }
      rangeStart = -1;
    }
    if (data[1].endsWith(', First>')) {
      rangeStart = cp;
      continue;
    }
    udict[cp] = data;
  }

  for (let [code, data] of Object.entries(udict)) {
    let [codeOrg, name, gencat, combine, bidi,
      decomp, deci, digit, num, mirror,
      old, iso, upcase, lowcase, titlecase] = data;

    // place letter in categories as appropriate
    for (let cat of [gencat, "Assigned"].concat(expandedCategories[gencat] || [])) {
      gencats[cat] ||= [];
      gencats[cat].push(Number.parseInt(code));
    }
  }

  return groupCats(gencats);
};

/**
 * @param {string} data 
 * @param {string[]} [interestingProps]
 * @return {Record<string, UnicodeRange[]>}
 */
let parseProperties = (data, interestingProps) => {
  let pattern = /^ *([0-9A-F]+)(?:\.\.([0-9A-F]+))? *; *(\w+)(?:; *(\w+))?/;

  /** @type {Record<string, UnicodeRange[]>} */
  let props = {};

  for (let line of data.split('\n')) {
    let match = line.match(pattern);
    if (!match) {
      continue;
    }

    let d_lo = match[1];
    let d_hi = match[2] || d_lo;
    let prop = match[3];
    let value = match[4];

    let propKey = value ? `${prop}=${value}` : prop;
    let propValue = value || prop;

    if (interestingProps && !interestingProps.some(p => propKey === p || prop === p)) {
      continue;
    }

    let lo = Number.parseInt(d_lo, 16);
    let hi = Number.parseInt(d_hi, 16);

    props[propValue] ||= [];
    props[propValue].push([lo, hi - lo]);
  }

  for (let [key, ranges] of Object.entries(props)) {
    props[key] = groupCat(ungroupCat(ranges));
  }

  return props;
};

/**
 * @param {string} data 
 * @param {string[]} [optsplit=[]]
 */
let parseTestData = (data, optsplit = []) => {
  /**
   * @param {string} str 
   * @param {UnicodeValues[]} chars 
   * @param {string[]} o
   * @return {[UnicodeValues[], string[]]}
   */
  let processSplitInfo = (str, chars, o) => {
    /** @type {UnicodeValues[]} */
    let outcs = [];
    /** @type {string[]} */
    let outis = [];
    let workcs = chars.shift();

    let s = str;

    // are we on a × or a ÷?
    let isX = false;
    if (s.startsWith('×')) {
      isX = true;
    }

    // find each instance of '(÷|×) [x.y] '
    while (s) {
      // find the currently considered rule number
      let sInd = s.indexOf('[') + 1;
      let eInd = s.indexOf(']');

      if (!isX || o.includes(s.substring(sInd, eInd))) {
        outis.push(s.substring(sInd, eInd));
        outcs.push(workcs || []);
        workcs = chars.shift();
      } else {
        workcs = workcs?.concat(chars.shift() || []);
      }

      let idx = 1;
      while (idx < s.length) {
        if (s.substring(idx).startsWith('×')) {
          isX = true;
          break;
        }
        if (s.substring(idx).startsWith('÷')) {
          isX = false;
          break;
        }
        idx += 1;
      }
      s = s.substring(idx);
    }

    outcs.push(workcs || []);
    return [outcs, outis];
  };

  /**
   * @param {string} str
   * @return {UnicodeValues[]}
   */
  let processSplitString = (str) => {
    /** @type {UnicodeValues[]} */
    let outls = [];

    /** @type {UnicodeValues} */
    let workls = [];

    let inls = str.split(' ');
    for (let i of inls) {
      if (i === '÷' || i === '×') {
        outls.push(workls);
        workls = [];
        continue;
      }

      let ival = Number.parseInt(`0x${i}`, 16);
      if (isSurrogate(ival)) {
        return [];
      }

      workls.push(ival);
    }

    if (workls.length) {
      outls.push(workls);
    }

    return outls;
  };

  let pattern = /^÷\s+([^\s].*[^\s])\s+÷\s+#\s+÷\s+\[0.2\].*?([÷×].*)\s+÷\s+\[0.3\]\s*$/;

  /**
   * @type {Array<[UnicodeValues[], string[]]>}
   */
  let testdata = [];
  for (let line of data.split('\n')) {
    // lines that include a test start with the ÷ character
    if (line.length < 2 || !line.startsWith('÷')) {
      continue;
    }

    let match = line.match(pattern);
    if (!match) {
      console.error(`error: no match on line where test was expected: ${line}`);
      continue;
    }

    // process the characters in this test case
    let chars = processSplitString(match[1]);
    // skip test case if it contains invalid characters (viz., surrogates)
    if (!chars.length) {
      continue;
    }

    let [proceedChars, info] = processSplitInfo(match[2], chars, optsplit);
    assert.equal(proceedChars.length - 1, info.length);

    testdata.push([proceedChars, info]);
  }

  return testdata;
};

/**
 * @template T
 * @param {WriteStream} f
 * @param {string} name
 * @param {T[]} table
 * @param {(row: T) => string} format
 */
let printTableCompressed = (f, name, table, format) => {
  f.write(`export const ${name} = JSON.parse('[`);
  let first = true;
  for (let row of table) {
    if (first) {
      f.write(format(row));
    } else {
      f.write(',' + format(row));
    }
    first = false;
  }
  f.write(`]');`);
};

/**
 * @template T
 * @param {WriteStream} f
 * @param {string} name
 * @param {T[]} table
 * @param {(row: T) => string} format
 */
let printTableRaw = (f, name, table, format) => {
  f.write(`export const ${name} = [\n`);
  for (let row of table) {
    f.write(`  ${format(row)},\n`);
  }
  f.write('];');
};

/**
 * @param {WriteStream} f 
 * @param {CategorizedUnicodeRange<any>[]} breakTable 
 * @param {string[]} breakCats 
 * @param {string} name 
 * @returns 
 */
let printBreakModule = (f, breakTable, breakCats, name) => {
  let cats = [...breakCats, 'Any'].toSorted();

  let capitalName = capitalize(name);
  let typeName = `${capitalName}Category`;
  let keyTypeName = `${typeName}Key`;
  let numTypeName = `${typeName}Num`;

  // We don't want the lookup table to be too large so choose a reasonable
  // cutoff. 0x20000 is selected because most of the range table entries are
  // within the interval of [0x0, 0x20000]
  let lookupValueCutoff = 0x20000;

  // Length of lookup table. It has to be a divisor of `lookup_value_cutoff`.
  let lookupTableLen = 0x80;

  let lookupInterval = Math.round(lookupValueCutoff / lookupTableLen);

  let lookupTable = Array.from({ length: lookupTableLen }, _ => 0);
  let j = 0;
  for (let i of range(0, lookupTableLen)) {
    let lookupFrom = i * lookupInterval;
    while (j < breakTable.length) {
      let [entryPoint, entryPadding] = breakTable[j];
      if (entryPoint + entryPadding >= lookupFrom) {
        break;
      }
      j += 1;
    }
    lookupTable[i] = j;
  }

  f.write(preamble);
  f.write(`
import {
  bsearchRange,
  createTable,
  createRangeTable,
} from './core.js';

/**
`,
  );

  /** @type {Record<string, number>} */
  let inversed = {};
  cats.forEach((cat, idx) => {
    inversed[cat] = idx;
    f.write(` * @typedef {${idx}} ${typeName[0]}C_${cat}\n`);
  });

  f.write(' * @typedef {(\n');
  for (let cat of cats) {
    f.write(` *   | ${typeName[0]}C_${cat}\n`);
  }
  f.write(` * )} ${numTypeName}\n`);
  f.write(' */\n\n');

  f.write(`
/**
 * @typedef {import('./core.js').CategorizedUnicodeRange<${numTypeName}>} ${typeName}Range
 *
 * NOTE: It might be garbage \`from\` and \`to\` values when the \`category\` is {@link ${typeName[0]}C_Any}.
 */

`.trimStart(),
  );

  f.write(`
/**
 * @typedef {(
`.trimStart(),
  );
  for (let cat of cats) {
    f.write(` *   | '${cat}'\n`);
  }
  f.write(` * )} ${keyTypeName}\n`);
  f.write(' */\n\n');

  f.write(`
/**
 * Grapheme category enum
 *
 * Note: The enum object is not actually \`Object.freeze\`
 * because it increases 800 bytes of Brotli compression... Not sure why :P
 *
 * @type {Readonly<Record<${keyTypeName}, ${numTypeName}>>}
 */
export const ${typeName} = {
`.trimStart(),
  );
  for (let cat of cats) {
    f.write(`  ${cat}: ${inversed[cat]},\n`);
  }
  f.write('};\n');

  f.write(`
export const ${name}_ranges = createRangeTable(
  new Uint32Array(${breakTable.length * 2}),
  '${breakTable.map(x => `${x[0] === 0 ? '' : x[0].toString(36)},${x[1] === 0 ? '' : x[1].toString(36)}`).join(',')}',
);
`);

  f.write(`
export const ${name}_cats = createTable(
  new Uint8Array(${breakTable.length}),
  '${breakTable.map(x => inversed[x[2]].toString(36)).join('')}',
  '',
);
`,
  );

  f.write(`
const ${name}_lookup = createTable(
  new Uint16Array(${lookupTable.length}),
  '${lookupTable.map(x => x === 0 ? '' : x.toString(36)).join(',')}',
);
`,
  );

  f.write(`
/**
 * @param {number} cp
 * @return An {@link ${typeName}Range} if found, or approx \`start\` and \`padding\` values with {@link ${typeName[0]}C_Any} category.
 */
export function find${capitalName}Index(cp) {
  // Perform a quick O(1) lookup in a precomputed table to determine
  // the slice of the range table to search in.
  let lookup_table = ${name}_lookup;
  let lookup_interval = ${lookupInterval};

  let idx = cp / lookup_interval | 0;
  // If the \`idx\` is outside of the precomputed table - use the slice
  // starting from the last covered index in the precomputed table and
  // ending with the length of the range table.
  let sliceFrom = ${j}, sliceTo = ${breakTable.length};
  if (idx + 1 < lookup_table.length) {
    sliceFrom = lookup_table[idx];
    sliceTo = lookup_table[idx + 1] + 1;
  }

  return bsearchRange(cp, ${name}_ranges, sliceFrom * 2, sliceTo * 2);
}
`,
  );
};

/**
 * @param {WriteStream} f 
 */
let printIncbModule = async f => {
  let ucd = await fetchData('DerivedCoreProperties.txt');
  let props = parseProperties(ucd, ['InCB=Consonant']);
  let table = props['Consonant'];

  f.write(preamble);
  f.write(`
import { createRangeTable } from './core.js';

/**
 * The Unicode \`Indic_Conjunct_Break=Consonant\` derived property table
 */
export const consonant_table = createRangeTable(
  new Uint16Array(${table.length * 2}),
  '${table.map(x => `${x[0] ? x[0].toString(36) : ''},${x[1] ? x[1].toString(36) : ''}`).join(',')}',
);
`,
  );
};

/**
 * @param {WriteStream} f 
 */
let printGeneralModule = async f => {
  let [
    gencatSrc,
    derivedSrc,
  ] = await Promise.all([
    fetchData('UnicodeData.txt'),
    fetchData('DerivedCoreProperties.txt'),
  ]);

  let gencats = parseGencats(gencatSrc);
  let derived = parseProperties(derivedSrc, ['Alphabetic']);

  f.write(preamble);
  f.write(`
/**
 * The Unicode \`L\` (Letter) property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
`,
  );
  printTableCompressed(f, 'letter_table', gencats['L'], formatRange);
  f.write('\n');

  f.write(`
/**
 * The Unicode \`N\` (Numeric) property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
`,
  )
  printTableCompressed(f, 'numeric_table', gencats['N'], formatRange);
  f.write('\n');

  f.write(`
/**
 * The Unicode \`Alphabetic\` property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
`,
  )
  printTableCompressed(f, 'alphabetic_table', derived['Alphabetic'], formatRange);
  f.write('\n');
};

/**
 * @param {WriteStream} f 
 */
let printEmojiModule = async f => {
  let emojiData = await fetchData('emoji/emoji-data.txt');
  let emojiProps = parseProperties(emojiData, ['Extended_Pictographic', 'Emoji_Presentation']);

  f.write(preamble);
  f.write(`
/**
 * The Unicode \`Emoji_Presentation\` property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
`,
  );
  printTableCompressed(
    f,
    'emoji_presentation_table',
    emojiProps['Emoji_Presentation'],
    formatRange,
  );
  f.write('\n');

  f.write(`
/**
 * The Unicode \`Extended_Pictographic\` property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
`,
  );
  printTableCompressed(
    f,
    'extended_pictographic_table',
    emojiProps['Extended_Pictographic'],
    formatRange,
  );
  f.write('\n');
};

/**
 * @param {WriteStream} f 
 */
let printTestDataModule = async f => {
  f.write(preamble);
  f.write(`
/**
 * @typedef {[input: string, expected: string[]]} TestCase
 */
`,
  );

  /**
   * @typedef {[UnicodeValues, UnicodeValues[]]} TestCaseRow
   */

  /**
   * @param {TestCaseRow} row 
   * @return {string}
   */
  let formatTestCase = row => {
    let outstr = `['`;
    for (let c of row[0]) {
      outstr += escapeUnicode(c);
    }
    outstr += `', [`;
    let xfirst = true;
    for (let x of [row[1]]) {
      if (!xfirst) {
        outstr += '], [';
      }
      xfirst = false;
      let sfirst = true;
      for (let sp of x) {
        if (!sfirst) {
          outstr += ', ';
        }
        sfirst = false;
        outstr += `'`;
        for (let c of sp) {
          outstr += escapeUnicode(c);
        }
        outstr += `'`;
      }
    }
    outstr += ']]';
    return outstr;
  };

  let grapehmeTestDataSrc = await fetchData('auxiliary/GraphemeBreakTest.txt');
  // rules 9.1 and 9.2 are for extended graphemes only
  let optsplits = ['9.1', '9.2'];
  let graphemeTestData = parseTestData(grapehmeTestDataSrc, optsplits);

  /** @type {TestCaseRow[]} */
  let tests = [];

  for (let [c, i] of graphemeTestData) {
    let allChars = c.flatMap(s => s);

    /** @type {UnicodeValues[]} */
    let extgraphs = [];

    /** @type {UnicodeValues} */
    let extwork = [];

    extwork = extwork.concat(c[0]);
    for (let n of range(0, i.length)) {
      if (optsplits.includes(i[n])) {
        extwork = extwork.concat(c[n + 1]);
      } else {
        extgraphs.push(extwork);
        extwork = [];
        extwork = extwork.concat(c[n + 1]);
      }
    }

    // These are the extended grapheme clusters
    // And the JS' segmenter only cares extended grapheme clusters
    extgraphs.push(extwork);

    if (arraysEqual(extgraphs, c)) {
      tests.push([allChars, c]);
    } else {
      tests.push([allChars, extgraphs]);
    }
  }

  f.write(`
/**
 * Official Unicode test data for extended grapheme clusters
 *
 * @see http://www.unicode.org/Public/${UNICODE_VERSION_STRING}/ucd/auxiliary/GraphemeBreakTest.txt
 *
 * @type {TestCase[]}
 */
`,
  );
  printTableRaw(f, 'TESTDATA_GRAPHEME', tests, formatTestCase);
  f.write('\n');
};

/**
 * @param {string} file
 * @param {(f: WriteStream) => Promise<void>} print 
 */
let emitSrc = async (file, print) => {
  let filePath = path.join(srcPath, file);
  let writeStream = createWriteStream(filePath, 'utf-8');
  try {
    await print(writeStream);
  } finally {
    writeStream.end();
  }
};

/**
 * @param {string} file
 * @param {(f: WriteStream) => Promise<void>} print
 */
let emitTest = async (file, print) => {
  let filePath = path.join(testPath, file);
  let writeStream = createWriteStream(filePath, 'utf-8');
  try {
    await print(writeStream);
  } finally {
    writeStream.end();
  }
};


// Start main procedure

let [
  graphemeData,
  emojiData,
  // wordData,
  // sentenceData,
] = await Promise.all([
  fetchData('auxiliary/GraphemeBreakProperty.txt'),
  fetchData('emoji/emoji-data.txt'),
  // fetchData('auxiliary/WordBreakProperty.txt'),
  // fetchData('auxiliary/SentenceBreakProperty.txt'),
]);

let graphemeCats = parseProperties(graphemeData);
// Control
//  Note:
// This category also includes Cs (surrogate codepoints).
// We have to remove Cs from the Control category
graphemeCats["Control"] = groupCat(Array.from(
  difference(
    new Set(ungroupCat(graphemeCats["Control"])),
    new Set(ungroupCat([[surrogateCodepoints[0], surrogateCodepoints[1] - surrogateCodepoints[0]]])),
  ),
));

let emojiProps = parseProperties(emojiData, ['Extended_Pictographic']);

/** @type {CategorizedUnicodeRange<any>[]} */
let graphemeTable = [];
for (let [cat, ranges] of Object.entries(graphemeCats)) {
  for (let [from, to] of ranges) {
    graphemeTable.push([from, to, cat]);
  }
}
for (let [cat, ranges] of Object.entries(emojiProps)) {
  for (let [from, to] of ranges) {
    graphemeTable.push([from, to, cat]);
  }
}
graphemeTable.sort((a, b) => a[0] - b[0]);

let last = -1;
for (let chars of graphemeTable) {
  if (chars[0] <= last) {
    throw new Error('Grapheme tables and Extended_Pictographic values overlap; need to store these separately!');
  }
  last = chars[1];
}

// let wordCats = parseProperties(wordData);
// /** @type {CategorizedUnicodeRange<any>[]}  */
// let wordTable = [];
// for (let [cat, ranges] of Object.entries(wordCats)) {
//   for (let [from, to] of ranges) {
//     graphemeTable.push([from, to, cat]);
//   }
// }
// wordTable.sort((a, b) => a[0] - b[0]);

// let sentenceCats = parseProperties(sentenceData);
// /** @type {CategorizedUnicodeRange<any>[]}  */
// let sentenceTable = [];
// for (let [cat, ranges] of Object.entries(sentenceCats)) {
//   for (let [from, to] of ranges) {
//     graphemeTable.push([from, to, cat]);
//   }
// }
// sentenceTable.sort((a, b) => a[0] - b[0]);

await emitSrc(
  '_grapheme_table.js',
  async f => printBreakModule(
    f,
    graphemeTable,
    Object.keys(graphemeCats).concat(['Extended_Pictographic']),
    'grapheme',
  ),
);

// emitSrc(
//   '_word_table.js',
//   async f => printBreakModule(
//     f,
//     wordTable,
//     Object.keys(wordCats),
//     'word',
//   ),
// );

// emitSrc(
//   '_sentence_table.js',
//   async f => printBreakModule(
//     f,
//     sentenceTable,
//     Object.keys(sentenceCats),
//     'sentence',
//   ),
// );

await emitSrc(
  '_incb_table.js',
  printIncbModule,
);

await emitSrc(
  '_general_table.js',
  printGeneralModule,
);

await emitSrc(
  '_emoji_table.js',
  printEmojiModule,
);

await emitTest(
  '_unicode_testdata.js',
  printTestDataModule,
);
