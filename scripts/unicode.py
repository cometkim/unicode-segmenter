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
# - auxiliary/GraphemeBreakTest.txt
# - auxiliary/WordBreakProperty.txt
# - auxiliary/WordBreakTest.txt
# - ReadMe.txt
# - UnicodeData.txt
#
# Since this should not require frequent updates, we just store this
# out-of-line and check the unicode.rs file into git.

import fileinput, re, os, sys

__dir__ = os.path.dirname(os.path.realpath(__file__))
src_path = os.path.normpath(os.path.join(__dir__, "../src"))
test_path = os.path.normpath(os.path.join(__dir__, "../test"))
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

def load_properties(f, interestingprops):
    fetch(f)
    props = {}

    re_full = re.compile(r"^ *([0-9A-F]+)(?:\.\.([0-9A-F]+))? *; *(\w+)(?:; *(\w+))?")

    for line in fileinput.input(os.path.basename(f)):
        m = re_full.match(line)
        if not m:
            continue

        d_lo = m.group(1)
        d_hi = m.group(2) if m.group(2) else m.group(1)
        prop = m.group(3)
        value = m.group(4)

        prop_key = f"{prop}={value}" if value else prop
        prop_value = value or prop

        if interestingprops and not any(prop_key == p or prop == p for p in interestingprops):
            continue
        d_lo = int(d_lo, 16)
        d_hi = int(d_hi, 16)
        if prop_value not in props:
            props[prop_value] = []
        props[prop_value].append((d_lo, d_hi))
    for prop in props:
        props[prop] = group_cat(ungroup_cat(props[prop]))

    return props

def load_test_data(f, optsplit=[]):
    testRe1 = re.compile(r"^÷\s+([^\s].*[^\s])\s+÷\s+#\s+÷\s+\[0.2\].*?([÷×].*)\s+÷\s+\[0.3\]\s*$")

    fetch(f)
    data = []
    for line in fileinput.input(os.path.basename(f)):
        # lines that include a test start with the ÷ character
        if len(line) < 2 or not line.startswith('÷'):
            continue

        m = testRe1.match(line)
        if not m:
            print("error: no match on line where test was expected: %s" % line)
            continue

        # process the characters in this test case
        chars = process_split_string(m.group(1))
        # skip test case if it contains invalid characters (viz., surrogates)
        if not chars:
            continue

        # now process test cases
        (chars, info) = process_split_info(m.group(2), chars, optsplit)

        # make sure that we have break info for each break!
        assert len(chars) - 1 == len(info)

        data.append((chars, info))

    return data

def process_split_info(s, c, o):
    outcs = []
    outis = []
    workcs = c.pop(0)

    # are we on a × or a ÷?
    isX = False
    if s.startswith('×'):
        isX = True

    # find each instance of '(÷|×) [x.y] '
    while s:
        # find the currently considered rule number
        sInd = s.index('[') + 1
        eInd = s.index(']')

        # if it's '× [a.b]' where 'a.b' is in o, then
        # we consider it a split even though it's not
        # marked as one
        # if it's ÷ then it's always a split
        if not isX or s[sInd:eInd] in o:
            outis.append(s[sInd:eInd])
            outcs.append(workcs)
            workcs = c.pop(0)
        else:
            workcs.extend(c.pop(0))

        idx = 1
        while idx < len(s):
            if s[idx:].startswith('×'):
                isX = True
                break
            if s[idx:].startswith('÷'):
                isX = False
                break
            idx += 1
        s = s[idx:]

    outcs.append(workcs)
    return (outcs, outis)

def process_split_string(s):
    outls = []
    workls = []

    inls = s.split()

    for i in inls:
        if i == '÷' or i == '×':
            outls.append(workls)
            workls = []
            continue

        ival = int(i,16)

        if is_surrogate(ival):
            return []

        workls.append(ival)

    if workls:
        outls.append(workls)

    return outls

def escape_char(c):
    return "\\u{%04x}" % c

def numeric_char(c):
    return "%d" % c

def print_range(x):
    return f"[{numeric_char(x[0])},{numeric_char(x[1])}]"

def print_testcase(x):
    outstr = "['"
    for c in x[0]:
        outstr += escape_char(c)
    outstr += "', ["
    xfirst = True
    for xx in x[1:]:
        if not xfirst:
            outstr += "], ["
        xfirst = False
        sfirst = True
        for sp in xx:
            if not sfirst:
                outstr += ", "
            sfirst = False
            outstr += "'"
            for c in sp:
                outstr += escape_char(c)
            outstr += "'"
    outstr += "]]"
    return outstr

def emit_table_raw(f, name, t_data, pfun):
    f.write("export const %s = [\n" % name)
    for data in t_data:
        f.write(f"  {pfun(data)},\n")
    f.write("];\n")

def emit_table_compressed(f, name, t_data, pfun):
    f.write("export const %s = JSON.parse('[" % name)
    first = True
    for data in t_data:
        if first: f.write(pfun(data))
        else: f.write("," + pfun(data))
        first = False
    f.write("]');\n")

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
    emit_table_compressed(f, "letter_table", gencats["L"], print_range)

    f.write("""
/**
 * The Unicode `N` (Number) property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
""")
    emit_table_compressed(f, "numeric_table", gencats["N"], print_range)

    f.write("""
/**
 * The Unicode `Alphabetic` property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
""")
    emit_table_compressed(f, "alphabetic_table", derived["Alphabetic"], print_range)

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
    emit_table_compressed(f, "emoji_table", emoji_props["Extended_Pictographic"], print_range)

    f.write("""
/**
 * The Unicode `Emoji_Presentation` property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
""")
    emit_table_compressed(f, "emoji_presentation_table", emoji_props["Emoji_Presentation"], print_range)

def emit_incb_module(f):
    incb_props = load_properties("DerivedCoreProperties.txt", ["InCB=Consonant"])

    f.write("// @ts-check\n")

    f.write("""
/**
 * The Unicode `Indic_Conjunct_Break=Consonant` derived property table
 *
 * @type {import('./core.js').UnicodeRange[]}
 */
""")
    emit_table_compressed(f, "consonant_table", incb_props["Consonant"], print_range)

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

    emit_table_compressed(f, f"{name}_cat_lookup", lookup_table,
               pfun=lambda x: "%d" % x)

    f.write("""
/**
 * @type {%sRange[]}
 */
""" % typename)

    emit_table_compressed(f, f"{name}_cat_table", break_table,
               pfun=lambda x: f"[{numeric_char(x[0])},{numeric_char(x[1])},{inversed[x[2]]}]")

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

def emit_testdata_module(f):
    create_testcase_typedef(f)
    f.write("\n")
    create_grapheme_data(f)
    # f.write("\n")
    # create_words_data(f)
    # f.write("\n")
    # create_sentence_data(f)

def create_testcase_typedef(f):
    f.write("// @ts-check\n")
    f.write("\n")
    f.write("/**\n")
    f.write(" * @typedef {[input: string, expected: string[]]} TestCase \n")
    f.write(" */\n")

def create_grapheme_data(f):
    # rules 9.1 and 9.2 are for extended graphemes only
    optsplits = ['9.1','9.2']
    d = load_test_data("auxiliary/GraphemeBreakTest.txt", optsplits)

    test = []

    for (c, i) in d:
        allchars = [cn for s in c for cn in s]
        extgraphs = []
        extwork = []

        extwork.extend(c[0])
        for n in range(0,len(i)):
            if i[n] in optsplits:
                extwork.extend(c[n+1])
            else:
                extgraphs.append(extwork)
                extwork = []
                extwork.extend(c[n+1])

        # These are the extended grapheme clusters
        # And the JS' segmenter only cares extended grapheme clusters
        extgraphs.append(extwork)

        if extgraphs == c:
            test.append((allchars, c))
        else:
            test.append((allchars, extgraphs))

    f.write("/**\n")
    f.write(" * Official Unicode test data for extended grapheme clusters\n")
    f.write(" *\n")
    f.write(" * @see http://www.unicode.org/Public/%s/ucd/auxiliary/GraphemeBreakTest.txt\n" % UNICODE_VERSION_NUMBER)
    f.write(" *\n")
    f.write(" * @type {TestCase[]}\n")
    f.write(" */\n")
    emit_table_raw(f, "TESTDATA_GRAPHEME", test, print_testcase)

def create_words_data(f):
    d = load_test_data("auxiliary/WordBreakTest.txt")

    test = []

    for (c, i) in d:
        allchars = [cn for s in c for cn in s]
        test.append((allchars, c))

    f.write("/**\n")
    f.write(" * Official Unicode test data for word breaks\n")
    f.write(" *\n")
    f.write(" * @see http://www.unicode.org/Public/%s/ucd/auxiliary/WordBreakTest.txt\n" % UNICODE_VERSION_NUMBER)
    f.write(" *\n")
    f.write(" * @type {TestCase[]}\n")
    f.write(" */\n")
    emit_table_raw(f, "TESTDATA_WORD", test, print_testcase)

def create_sentence_data(f):
    d = load_test_data("auxiliary/SentenceBreakTest.txt")

    test = []

    for (c, i) in d:
        allchars = [cn for s in c for cn in s]
        test.append((allchars, c))

    f.write("/**\n")
    f.write(" * Official Unicode test data for sentence breaks\n")
    f.write(" *\n")
    f.write(" * @see http://www.unicode.org/Public/%s/ucd/auxiliary/SentenceBreakTest.txt\n" % UNICODE_VERSION_NUMBER)
    f.write(" *\n")
    f.write(" * @type {TestCase[]}\n")
    f.write(" */\n")
    emit_table_raw(f, "TESTDATA_SENTENCE", test, print_testcase)

def emit_src(file, emit):
    r = os.path.join(src_path, file)
    if os.path.exists(r):
        os.remove(r)
    with open(r, "w") as rf:
        emit(rf)

def emit_test(file, emit):
    r = os.path.join(test_path, file)
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
    # This category also includes Cs (surrogate codepoints).
    # We have to remove Cs from the Control category
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

    emit_src(
        "_incb_table.js",
        emit_incb_module,
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

    emit_test(
        "_unicode_testdata.js",
        emit_testdata_module,
    )
