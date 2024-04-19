#!/usr/bin/env python
#
# Copyright 2011-2015 The Rust Project Developers. See the COPYRIGHT
# file at the top-level directory of this distribution and at
# http://rust-lang.org/COPYRIGHT.
#
# Licensed under the MIT license <LICENSE-MIT or http://opensource.org/licenses/MIT>.
#
# Modified original Rust library [unicode-segmentation]
# (https://unicode-rs.github.io/unicode-segmentation)
#
# to create JavaScript library, [unicode-segmenter]
# (https://github.com/cometkim/unicode-segmenter)

# This script uses the following Unicode tables:
# - DerivedCoreProperties.txt
# - auxiliary/GraphemeBreakProperty.txt
# - auxiliary/WordBreakProperty.txt
# - ReadMe.txt
# - UnicodeData.txt
#
# Since this should not require frequent updates, we just store this
# out-of-line and check the unicode.rs file into git.

import fileinput, re, os, sys

__dir__ = os.path.dirname(os.path.realpath(__file__))
src_path = os.path.normpath(os.path.join(__dir__, "../src"))
data_path = os.path.join(__dir__, "unicode_data")

os.makedirs(data_path, exist_ok=True)

preamble = '''// Copyright 2012-2018 The Rust Project Developers. See the COPYRIGHT
// file at the top-level directory of this distribution and at
// http://rust-lang.org/COPYRIGHT.
//
// Licensed under the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>.
//
// Modified original Rust library [unicode-segmentation]
// (https://unicode-rs.github.io/unicode-segmentation)
//
// to create JavaScript library, [unicode-segmenter]
// (https://github.com/cometkim/unicode-segmenter)

// NOTE: The following code was generated by "scripts/unicode.py", do not edit directly
'''

# Mapping taken from Table 12 from:
# http://www.unicode.org/reports/tr44/#General_Category_Values
expanded_categories = {
    'Lu': ['LC', 'L'], 'Ll': ['LC', 'L'], 'Lt': ['LC', 'L'],
    'Lm': ['L'], 'Lo': ['L'],
    'Mn': ['M'], 'Mc': ['M'], 'Me': ['M'],
    'Nd': ['N'], 'Nl': ['N'], 'No': ['N'],
    'Pc': ['P'], 'Pd': ['P'], 'Ps': ['P'], 'Pe': ['P'],
    'Pi': ['P'], 'Pf': ['P'], 'Po': ['P'],
    'Sm': ['S'], 'Sc': ['S'], 'Sk': ['S'], 'So': ['S'],
    'Zs': ['Z'], 'Zl': ['Z'], 'Zp': ['Z'],
    'Cc': ['C'], 'Cf': ['C'], 'Cs': ['C'], 'Co': ['C'], 'Cn': ['C'],
}

# these are the surrogate codepoints, which are not valid rust characters
surrogate_codepoints = (0xd800, 0xdfff)

UNICODE_VERSION = (15, 1, 0)
UNICODE_VERSION_NUMBER = "%s.%s.%s" %UNICODE_VERSION

def is_surrogate(n):
    return surrogate_codepoints[0] <= n <= surrogate_codepoints[1]

def fetch(f):
    os.chdir(data_path)
    if not os.path.exists(os.path.basename(f)):
        if "emoji" in f:
            os.system("curl -O https://www.unicode.org/Public/%s/ucd/emoji/%s"
                      % (UNICODE_VERSION_NUMBER, f))
        else:
            os.system("curl -O https://www.unicode.org/Public/%s/ucd/%s"
                      % (UNICODE_VERSION_NUMBER, f))

    if not os.path.exists(os.path.basename(f)):
        sys.stderr.write("cannot load %s" % f)
        exit(1)

def load_gencats(f):
    fetch(f)
    gencats = {}

    udict = {};
    range_start = -1;
    for line in fileinput.input(f):
        data = line.split(';');
        if len(data) != 15:
            continue
        cp = int(data[0], 16);
        if is_surrogate(cp):
            continue
        if range_start >= 0:
            for i in range(range_start, cp):
                udict[i] = data;
            range_start = -1;
        if data[1].endswith(", First>"):
            range_start = cp;
            continue;
        udict[cp] = data;

    for code in udict:
        [code_org, name, gencat, combine, bidi,
         decomp, deci, digit, num, mirror,
         old, iso, upcase, lowcase, titlecase ] = udict[code];

        # place letter in categories as appropriate
        for cat in [gencat, "Assigned"] + expanded_categories.get(gencat, []):
            if cat not in gencats:
                gencats[cat] = []
            gencats[cat].append(code)

    gencats = group_cats(gencats)
    return gencats

def group_cats(cats):
    cats_out = {}
    for cat in cats:
        cats_out[cat] = group_cat(cats[cat])
    return cats_out

def group_cat(cat):
    cat_out = []
    letters = sorted(set(cat))
    cur_start = letters.pop(0)
    cur_end = cur_start
    for letter in letters:
        assert letter > cur_end, \
            "cur_end: %s, letter: %s" % (hex(cur_end), hex(letter))
        if letter == cur_end + 1:
            cur_end = letter
        else:
            cat_out.append((cur_start, cur_end))
            cur_start = cur_end = letter
    cat_out.append((cur_start, cur_end))
    return cat_out

def ungroup_cat(cat):
    cat_out = []
    for (lo, hi) in cat:
        while lo <= hi:
            cat_out.append(lo)
            lo += 1
    return cat_out

def format_table_content(f, content, indent):
    line = " "*indent
    first = True
    for chunk in content.split(","):
        if len(line) + len(chunk) < 98:
            if first:
                line += chunk
            else:
                line += ", " + chunk
            first = False
        else:
            f.write(line + ",\n")
            line = " "*indent + chunk
    f.write(line)

def load_properties(f, interestingprops):
    fetch(f)
    props = {}
    re1 = re.compile(r"^ *([0-9A-F]+) *; *(\w+)")
    re2 = re.compile(r"^ *([0-9A-F]+)\.\.([0-9A-F]+) *; *(\w+)")

    for line in fileinput.input(os.path.basename(f)):
        prop = None
        d_lo = 0
        d_hi = 0
        m = re1.match(line)
        if m:
            d_lo = m.group(1)
            d_hi = m.group(1)
            prop = m.group(2)
        else:
            m = re2.match(line)
            if m:
                d_lo = m.group(1)
                d_hi = m.group(2)
                prop = m.group(3)
            else:
                continue
        if interestingprops and prop not in interestingprops:
            continue
        d_lo = int(d_lo, 16)
        d_hi = int(d_hi, 16)
        if prop not in props:
            props[prop] = []
        props[prop].append((d_lo, d_hi))

    # optimize if possible
    for prop in props:
        props[prop] = group_cat(ungroup_cat(props[prop]))

    return props

def escape_char(c):
    return "%d" % c

def emit_table(f, name, t_data, pfun=lambda x: f"[{escape_char(x[0])},{escape_char(x[1])}]"):
    f.write("export const %s = [\n" % name)
    data = ""
    first = True
    for dat in t_data:
        if not first:
            data += ","
        first = False
        data += pfun(dat)
    format_table_content(f, data, 2)
    f.write(",\n];\n")

def emit_general_module(f):
    gencats = load_gencats("UnicodeData.txt")
    derived = load_properties("DerivedCoreProperties.txt", ["Alphabetic"])

    f.write("// @ts-check\n")

    f.write("""
/**
 * The Unicode `L` (Letter) property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
""")
    emit_table(f, "letter_table", gencats["L"])

    f.write("""
/**
 * The Unicode `N` (Number) property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
""")
    emit_table(f, "numeric_table", gencats["N"])

    f.write("""
/**
 * The Unicode `Alphabetic` property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
""")
    emit_table(f, "alphabetic_table", derived["Alphabetic"])

def emit_emoji_module(f):
    emoji_props = load_properties("emoji-data.txt", ["Extended_Pictographic", "Emoji_Presentation"])

    f.write("// @ts-check\n")

    f.write("""
/**
 * The Unicode `Extended_Pictographic` property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
""")
    emit_table(f, "emoji_table", emoji_props["Extended_Pictographic"])

    f.write("""
/**
 * The Unicode `Emoji_Presentation` property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
""")
    emit_table(f, "emoji_presentation_table", emoji_props["Emoji_Presentation"])

def emit_break_module(f, break_table, break_cats, name):
    Name = name.capitalize()
    typename = f"{Name}Category"

    # We don't want the lookup table to be too large so choose a reasonable
    # cutoff. 0x20000 is selected because most of the range table entries are
    # within the interval of [0x0, 0x20000]
    lookup_value_cutoff = 0x20000

    # Length of lookup table. It has to be a divisor of `lookup_value_cutoff`.
    lookup_table_len = 0x400

    lookup_interval = round(lookup_value_cutoff / lookup_table_len)

    # Lookup table is a mapping from `character code / lookup_interval` to
    # the index in the range table that covers the `character code`.
    lookup_table = [0] * lookup_table_len
    j = 0
    for i in range(0, lookup_table_len):
      lookup_from = i * lookup_interval
      while j < len(break_table):
        (_, entry_to, _) = break_table[j]
        if entry_to >= lookup_from:
          break
        j += 1
      lookup_table[i] = j

    break_cats.append("Any")
    break_cats.sort()

    f.write(preamble)

    f.write("""
// @ts-check

import { bsearchUnicodeRange } from './core.js';

/**
""")
    inversed = {}
    for idx, cat in enumerate(break_cats):
        inversed[cat] = idx
        f.write(" * @typedef {%d} %s\n" % (idx, f"{Name[0]}C_{cat}"))
    f.write(" * @typedef {(\n")
    for cat in break_cats:
        f.write(f" *   | {Name[0]}C_{cat}\n")
    f.write(" * )} %s\n" % typename)
    f.write(" */\n")

    f.write("""
/**
 * @typedef {import('./core.js').CategorizedUnicodeRange<%s>} %sRange
 *
 * NOTE: It might be garbage `from` and `to` values when the `category` is {@link %sC_Any}.
 */
""" % (typename, typename, Name[0]))

    f.write("""
/**
 * Grapheme category enum
 *
 * Note: The enum object is not actually `Object.freeze`
 * because it increases 800 bytes of Brotli compression... Not sure why :P
 *
 * @type {Readonly<Record<string, %s>>}
 */
export const %s = {
""" % (typename, typename))
    for cat in break_cats:
        f.write(f"  {cat}: {inversed[cat]},\n")
    f.write("};\n\n")

    emit_table(f, f"{name}_cat_lookup", lookup_table,
               pfun=lambda x: "%d" % x)

    f.write("""
/**
 * @type {%sRange[]}
 */
""" % typename)

    emit_table(f, f"{name}_cat_table", break_table,
               pfun=lambda x: f"[{escape_char(x[0])},{escape_char(x[1])},{inversed[x[2]]}]")

    f.write("""
/**
 * @param {number} cp
 * @return An exact {@link %sRange} if found, or garbage `start` and `from` values with {@link %sC_Any} category.
 */
export function search%s(cp) {
  // Perform a quick O(1) lookup in a precomputed table to determine
  // the slice of the range table to search in.
  let lookup_table = %s_cat_lookup;
  let lookup_interval = 0x%x;

  let idx = cp / lookup_interval | 0;
  // If the `idx` is outside of the precomputed table - use the slice
  // starting from the last covered index in the precomputed table and
  // ending with the length of the range table.
  let sliceFrom = %d, sliceTo = %d;
  if (idx + 1 < lookup_table.length) {
    sliceFrom = lookup_table[idx];
    sliceTo = lookup_table[idx + 1] + 1;
  }

  // Compute pessimistic default lower and upper bounds on the category.
  // If character doesn't map to any range and there is no adjacent range
  // in the table slice - these bounds has to apply.
  let lower = idx * lookup_interval;
  let upper = lower + lookup_interval - 1;
  return bsearchUnicodeRange(cp, %s_cat_table, lower, upper, sliceFrom, sliceTo);
}
""" % (typename, Name[0], typename, name, lookup_interval, j, len(break_table), name))

def emit_src(file, emit):
    r = os.path.join(src_path, file)
    if os.path.exists(r):
        os.remove(r)
    with open(r, "w") as rf:
        emit(rf)

if __name__ == "__main__":
    ### grapheme cluster module
    # from http://www.unicode.org/reports/tr29/#Grapheme_Cluster_Break_Property_Values
    grapheme_cats = load_properties("auxiliary/GraphemeBreakProperty.txt", [])

    # Control
    #  Note:
    # This category also includes Cs (surrogate codepoints), but Rust's `char`s are
    # Unicode Scalar Values only, and surrogates are thus invalid `char`s.
    # Thus, we have to remove Cs from the Control category
    grapheme_cats["Control"] = group_cat(list(
        set(ungroup_cat(grapheme_cats["Control"]))
        - set(ungroup_cat([surrogate_codepoints]))))

    grapheme_table = []
    for cat in grapheme_cats:
        grapheme_table.extend([(x, y, cat) for (x, y) in grapheme_cats[cat]])
    emoji_props = load_properties("emoji-data.txt", ["Extended_Pictographic"])
    grapheme_table.extend([(x, y, "Extended_Pictographic") for (x, y) in emoji_props["Extended_Pictographic"]])
    grapheme_table.sort(key=lambda w: w[0])
    last = -1
    for chars in grapheme_table:
        if chars[0] <= last:
            raise Exception("Grapheme tables and Extended_Pictographic values overlap; need to store these separately!")
        last = chars[1]

    word_cats = load_properties("auxiliary/WordBreakProperty.txt", [])
    word_table = []
    for cat in word_cats:
        word_table.extend([(x, y, cat) for (x, y) in word_cats[cat]])
    word_table.sort(key=lambda w: w[0])

    # There are some emoji which are also ALetter, so this needs to be stored separately
    # For efficiency, we could still merge the two tables and produce an ALetterEP state
    emoji_table = [(x, y, "Extended_Pictographic") for (x, y) in emoji_props["Extended_Pictographic"]]

    sentence_cats = load_properties("auxiliary/SentenceBreakProperty.txt", [])
    sentence_table = []
    for cat in sentence_cats:
        sentence_table.extend([(x, y, cat) for (x, y) in sentence_cats[cat]])
    sentence_table.sort(key=lambda w: w[0])

    emit_src(
        "_grapheme_table.js",
        lambda f: emit_break_module(
            f,
            grapheme_table,
            list(grapheme_cats.keys()) + ["Extended_Pictographic"],
            "grapheme"
        )
    )

    # NOTE:
    # The unicode-segmentation's word boundary implementation is only default boundary rules that don't follow language-specific rules and cannot be used as a replacement for the `Intl.Segmenter` API.
    # As it doesn't work at all for CJK, there is no motivation to implement them here.

    # dependency of word and sentence
    emit_src(
        "_general_table.js",
        emit_general_module
    )

    emit_src(
        "_emoji_table.js",
        emit_emoji_module
    )

    # emit_src(
    #     "_word_table.js",
    #     lambda f: emit_break_module(
    #         f,
    #         word_table,
    #         list(word_cats.keys()),
    #         "word"
    #     )
    # )

    # emit_src(
    #     "_emoji_table.js",
    #     lambda f: emit_break_module(
    #         f,
    #         emoji_table,
    #         ["Extended_Pictographic"],
    #         "emoji"
    #     )
    # )

    # emit_src(
    #     "_sentence_table.js",
    #     lambda f: emit_break_module(
    #         f,
    #         sentence_table,
    #         list(sentence_cats.keys()),
    #         "sentence"
    #     )
    # )

