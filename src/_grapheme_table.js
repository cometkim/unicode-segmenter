// Copyright 2012-2018 The Rust Project Developers. See the COPYRIGHT
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

// @ts-check

import { bsearchUnicodeRange } from './core.js';

/**
 * @typedef {0} GC_Any
 * @typedef {1} GC_CR
 * @typedef {2} GC_Control
 * @typedef {3} GC_Extend
 * @typedef {4} GC_Extended_Pictographic
 * @typedef {5} GC_L
 * @typedef {6} GC_LF
 * @typedef {7} GC_LV
 * @typedef {8} GC_LVT
 * @typedef {9} GC_Prepend
 * @typedef {10} GC_Regional_Indicator
 * @typedef {11} GC_SpacingMark
 * @typedef {12} GC_T
 * @typedef {13} GC_V
 * @typedef {14} GC_ZWJ
 * @typedef {(
 *   | GC_Any
 *   | GC_CR
 *   | GC_Control
 *   | GC_Extend
 *   | GC_Extended_Pictographic
 *   | GC_L
 *   | GC_LF
 *   | GC_LV
 *   | GC_LVT
 *   | GC_Prepend
 *   | GC_Regional_Indicator
 *   | GC_SpacingMark
 *   | GC_T
 *   | GC_V
 *   | GC_ZWJ
 * )} GraphemeCategory
 */

/**
 * @typedef {import('./core.js').CategorizedUnicodeRange<GraphemeCategory>} GraphemeCategoryRange
 *
 * NOTE: It might be garbage `from` and `to` values when the `category` is {@link GC_Any}.
 */

/**
 * Grapheme category enum
 *
 * Note: The enum object is not actually `Object.freeze`
 * because it increases 800 bytes of Brotli compression... Not sure why :P
 *
 * @type {Readonly<Record<string, GraphemeCategory>>}
 */
export const GraphemeCategory = {
  Any: 0,
  CR: 1,
  Control: 2,
  Extend: 3,
  Extended_Pictographic: 4,
  L: 5,
  LF: 6,
  LV: 7,
  LVT: 8,
  Prepend: 9,
  Regional_Indicator: 10,
  SpacingMark: 11,
  T: 12,
  V: 13,
  ZWJ: 14,
};

export const grapheme_cat_lookup = JSON.parse(`[0,5,9,9,9,9,9,10,10,10,11,11,16,21,26,29,32,37,41,53,65,75,86,97,106,116,131,143,153,157,161,168,173,183,188,189,191,191,191,192,192,192,192,192,192,192,192,198,206,209,211,219,219,232,233,242,258,262,270,270,271,271,271,271,271,279,280,282,284,284,284,286,290,290,291,291,295,297,298,313,317,317,317,318,318,318,318,322,322,322,323,324,325,325,325,325,325,328,329,329,329,329,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,331,333,335,335,335,342,347,351,360,369,379,379,386,395,405,413,423,431,441,450,459,469,477,487,495,505,514,523,533,541,551,559,569,578,587,597,605,615,623,633,642,651,661,669,679,687,697,706,715,725,733,743,751,761,770,779,789,797,807,815,825,834,843,853,861,871,879,889,898,907,917,925,935,943,953,962,971,981,989,999,1007,1017,1026,1035,1045,1053,1063,1071,1081,1090,1099,1109,1117,1127,1135,1145,1154,1163,1173,1181,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1186,1187,1187,1187,1187,1187,1187,1189,1190,1190,1192,1192,1192,1192,1193,1193,1194,1195,1195,1195,1195,1195,1195,1195,1195,1195,1195,1195,1195,1195,1195,1200,1201,1201,1201,1201,1201,1202,1202,1202,1204,1205,1206,1212,1221,1227,1236,1244,1247,1260,1260,1267,1278,1278,1286,1292,1299,1303,1303,1307,1307,1318,1324,1333,1337,1337,1337,1342,1349,1355,1361,1361,1363,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1372,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1375,1376,1377,1377,1377,1377,1377,1377,1377,1377,1378,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1382,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1384,1386,1386,1386,1386,1392,1395,1396,1396,1396,1396,1396,1396,1396,1396,1396,1396,1396,1396,1396,1396,1396,1396,1399,1402,1402,1402,1402,1402,1402,1402,1402,1402,1402,1402,1407,1408,1409,1409,1409,1411,1411,1411,1411,1412,1412,1412,1412,1412,1412,1412,1412,1413,1414,1414,1414,1414,1414,1414,1414,1414,1414,1414,1414,1414,1414,1414,1414,1415,1419,1423,1428,1428,1428,1430,1430,1430,1431,1431,1432,1433,1434,1435,1438,1440,1442,1442,1442,1443,1443,1443,1443,1443,1443,1443,1443,1443,1443]`);

/**
 * @type {GraphemeCategoryRange[]}
 */
export const grapheme_cat_table = JSON.parse(`[[0,9,2],[10,10,6],[11,12,2],[13,13,1],[14,31,2],[127,159,2],[169,169,4],[173,173,2],[174,174,4],[768,879,3],[1155,1161,3],[1425,1469,3],[1471,1471,3],[1473,1474,3],[1476,1477,3],[1479,1479,3],[1536,1541,9],[1552,1562,3],[1564,1564,2],[1611,1631,3],[1648,1648,3],[1750,1756,3],[1757,1757,9],[1759,1764,3],[1767,1768,3],[1770,1773,3],[1807,1807,9],[1809,1809,3],[1840,1866,3],[1958,1968,3],[2027,2035,3],[2045,2045,3],[2070,2073,3],[2075,2083,3],[2085,2087,3],[2089,2093,3],[2137,2139,3],[2192,2193,9],[2200,2207,3],[2250,2273,3],[2274,2274,9],[2275,2306,3],[2307,2307,11],[2362,2362,3],[2363,2363,11],[2364,2364,3],[2366,2368,11],[2369,2376,3],[2377,2380,11],[2381,2381,3],[2382,2383,11],[2385,2391,3],[2402,2403,3],[2433,2433,3],[2434,2435,11],[2492,2492,3],[2494,2494,3],[2495,2496,11],[2497,2500,3],[2503,2504,11],[2507,2508,11],[2509,2509,3],[2519,2519,3],[2530,2531,3],[2558,2558,3],[2561,2562,3],[2563,2563,11],[2620,2620,3],[2622,2624,11],[2625,2626,3],[2631,2632,3],[2635,2637,3],[2641,2641,3],[2672,2673,3],[2677,2677,3],[2689,2690,3],[2691,2691,11],[2748,2748,3],[2750,2752,11],[2753,2757,3],[2759,2760,3],[2761,2761,11],[2763,2764,11],[2765,2765,3],[2786,2787,3],[2810,2815,3],[2817,2817,3],[2818,2819,11],[2876,2876,3],[2878,2879,3],[2880,2880,11],[2881,2884,3],[2887,2888,11],[2891,2892,11],[2893,2893,3],[2901,2903,3],[2914,2915,3],[2946,2946,3],[3006,3006,3],[3007,3007,11],[3008,3008,3],[3009,3010,11],[3014,3016,11],[3018,3020,11],[3021,3021,3],[3031,3031,3],[3072,3072,3],[3073,3075,11],[3076,3076,3],[3132,3132,3],[3134,3136,3],[3137,3140,11],[3142,3144,3],[3146,3149,3],[3157,3158,3],[3170,3171,3],[3201,3201,3],[3202,3203,11],[3260,3260,3],[3262,3262,11],[3263,3263,3],[3264,3265,11],[3266,3266,3],[3267,3268,11],[3270,3270,3],[3271,3272,11],[3274,3275,11],[3276,3277,3],[3285,3286,3],[3298,3299,3],[3315,3315,11],[3328,3329,3],[3330,3331,11],[3387,3388,3],[3390,3390,3],[3391,3392,11],[3393,3396,3],[3398,3400,11],[3402,3404,11],[3405,3405,3],[3406,3406,9],[3415,3415,3],[3426,3427,3],[3457,3457,3],[3458,3459,11],[3530,3530,3],[3535,3535,3],[3536,3537,11],[3538,3540,3],[3542,3542,3],[3544,3550,11],[3551,3551,3],[3570,3571,11],[3633,3633,3],[3635,3635,11],[3636,3642,3],[3655,3662,3],[3761,3761,3],[3763,3763,11],[3764,3772,3],[3784,3790,3],[3864,3865,3],[3893,3893,3],[3895,3895,3],[3897,3897,3],[3902,3903,11],[3953,3966,3],[3967,3967,11],[3968,3972,3],[3974,3975,3],[3981,3991,3],[3993,4028,3],[4038,4038,3],[4141,4144,3],[4145,4145,11],[4146,4151,3],[4153,4154,3],[4155,4156,11],[4157,4158,3],[4182,4183,11],[4184,4185,3],[4190,4192,3],[4209,4212,3],[4226,4226,3],[4228,4228,11],[4229,4230,3],[4237,4237,3],[4253,4253,3],[4352,4447,5],[4448,4519,13],[4520,4607,12],[4957,4959,3],[5906,5908,3],[5909,5909,11],[5938,5939,3],[5940,5940,11],[5970,5971,3],[6002,6003,3],[6068,6069,3],[6070,6070,11],[6071,6077,3],[6078,6085,11],[6086,6086,3],[6087,6088,11],[6089,6099,3],[6109,6109,3],[6155,6157,3],[6158,6158,2],[6159,6159,3],[6277,6278,3],[6313,6313,3],[6432,6434,3],[6435,6438,11],[6439,6440,3],[6441,6443,11],[6448,6449,11],[6450,6450,3],[6451,6456,11],[6457,6459,3],[6679,6680,3],[6681,6682,11],[6683,6683,3],[6741,6741,11],[6742,6742,3],[6743,6743,11],[6744,6750,3],[6752,6752,3],[6754,6754,3],[6757,6764,3],[6765,6770,11],[6771,6780,3],[6783,6783,3],[6832,6862,3],[6912,6915,3],[6916,6916,11],[6964,6970,3],[6971,6971,11],[6972,6972,3],[6973,6977,11],[6978,6978,3],[6979,6980,11],[7019,7027,3],[7040,7041,3],[7042,7042,11],[7073,7073,11],[7074,7077,3],[7078,7079,11],[7080,7081,3],[7082,7082,11],[7083,7085,3],[7142,7142,3],[7143,7143,11],[7144,7145,3],[7146,7148,11],[7149,7149,3],[7150,7150,11],[7151,7153,3],[7154,7155,11],[7204,7211,11],[7212,7219,3],[7220,7221,11],[7222,7223,3],[7376,7378,3],[7380,7392,3],[7393,7393,11],[7394,7400,3],[7405,7405,3],[7412,7412,3],[7415,7415,11],[7416,7417,3],[7616,7679,3],[8203,8203,2],[8204,8204,3],[8205,8205,14],[8206,8207,2],[8232,8238,2],[8252,8252,4],[8265,8265,4],[8288,8303,2],[8400,8432,3],[8482,8482,4],[8505,8505,4],[8596,8601,4],[8617,8618,4],[8986,8987,4],[9000,9000,4],[9096,9096,4],[9167,9167,4],[9193,9203,4],[9208,9210,4],[9410,9410,4],[9642,9643,4],[9654,9654,4],[9664,9664,4],[9723,9726,4],[9728,9733,4],[9735,9746,4],[9748,9861,4],[9872,9989,4],[9992,10002,4],[10004,10004,4],[10006,10006,4],[10013,10013,4],[10017,10017,4],[10024,10024,4],[10035,10036,4],[10052,10052,4],[10055,10055,4],[10060,10060,4],[10062,10062,4],[10067,10069,4],[10071,10071,4],[10083,10087,4],[10133,10135,4],[10145,10145,4],[10160,10160,4],[10175,10175,4],[10548,10549,4],[11013,11015,4],[11035,11036,4],[11088,11088,4],[11093,11093,4],[11503,11505,3],[11647,11647,3],[11744,11775,3],[12330,12335,3],[12336,12336,4],[12349,12349,4],[12441,12442,3],[12951,12951,4],[12953,12953,4],[42607,42610,3],[42612,42621,3],[42654,42655,3],[42736,42737,3],[43010,43010,3],[43014,43014,3],[43019,43019,3],[43043,43044,11],[43045,43046,3],[43047,43047,11],[43052,43052,3],[43136,43137,11],[43188,43203,11],[43204,43205,3],[43232,43249,3],[43263,43263,3],[43302,43309,3],[43335,43345,3],[43346,43347,11],[43360,43388,5],[43392,43394,3],[43395,43395,11],[43443,43443,3],[43444,43445,11],[43446,43449,3],[43450,43451,11],[43452,43453,3],[43454,43456,11],[43493,43493,3],[43561,43566,3],[43567,43568,11],[43569,43570,3],[43571,43572,11],[43573,43574,3],[43587,43587,3],[43596,43596,3],[43597,43597,11],[43644,43644,3],[43696,43696,3],[43698,43700,3],[43703,43704,3],[43710,43711,3],[43713,43713,3],[43755,43755,11],[43756,43757,3],[43758,43759,11],[43765,43765,11],[43766,43766,3],[44003,44004,11],[44005,44005,3],[44006,44007,11],[44008,44008,3],[44009,44010,11],[44012,44012,11],[44013,44013,3],[44032,44032,7],[44033,44059,8],[44060,44060,7],[44061,44087,8],[44088,44088,7],[44089,44115,8],[44116,44116,7],[44117,44143,8],[44144,44144,7],[44145,44171,8],[44172,44172,7],[44173,44199,8],[44200,44200,7],[44201,44227,8],[44228,44228,7],[44229,44255,8],[44256,44256,7],[44257,44283,8],[44284,44284,7],[44285,44311,8],[44312,44312,7],[44313,44339,8],[44340,44340,7],[44341,44367,8],[44368,44368,7],[44369,44395,8],[44396,44396,7],[44397,44423,8],[44424,44424,7],[44425,44451,8],[44452,44452,7],[44453,44479,8],[44480,44480,7],[44481,44507,8],[44508,44508,7],[44509,44535,8],[44536,44536,7],[44537,44563,8],[44564,44564,7],[44565,44591,8],[44592,44592,7],[44593,44619,8],[44620,44620,7],[44621,44647,8],[44648,44648,7],[44649,44675,8],[44676,44676,7],[44677,44703,8],[44704,44704,7],[44705,44731,8],[44732,44732,7],[44733,44759,8],[44760,44760,7],[44761,44787,8],[44788,44788,7],[44789,44815,8],[44816,44816,7],[44817,44843,8],[44844,44844,7],[44845,44871,8],[44872,44872,7],[44873,44899,8],[44900,44900,7],[44901,44927,8],[44928,44928,7],[44929,44955,8],[44956,44956,7],[44957,44983,8],[44984,44984,7],[44985,45011,8],[45012,45012,7],[45013,45039,8],[45040,45040,7],[45041,45067,8],[45068,45068,7],[45069,45095,8],[45096,45096,7],[45097,45123,8],[45124,45124,7],[45125,45151,8],[45152,45152,7],[45153,45179,8],[45180,45180,7],[45181,45207,8],[45208,45208,7],[45209,45235,8],[45236,45236,7],[45237,45263,8],[45264,45264,7],[45265,45291,8],[45292,45292,7],[45293,45319,8],[45320,45320,7],[45321,45347,8],[45348,45348,7],[45349,45375,8],[45376,45376,7],[45377,45403,8],[45404,45404,7],[45405,45431,8],[45432,45432,7],[45433,45459,8],[45460,45460,7],[45461,45487,8],[45488,45488,7],[45489,45515,8],[45516,45516,7],[45517,45543,8],[45544,45544,7],[45545,45571,8],[45572,45572,7],[45573,45599,8],[45600,45600,7],[45601,45627,8],[45628,45628,7],[45629,45655,8],[45656,45656,7],[45657,45683,8],[45684,45684,7],[45685,45711,8],[45712,45712,7],[45713,45739,8],[45740,45740,7],[45741,45767,8],[45768,45768,7],[45769,45795,8],[45796,45796,7],[45797,45823,8],[45824,45824,7],[45825,45851,8],[45852,45852,7],[45853,45879,8],[45880,45880,7],[45881,45907,8],[45908,45908,7],[45909,45935,8],[45936,45936,7],[45937,45963,8],[45964,45964,7],[45965,45991,8],[45992,45992,7],[45993,46019,8],[46020,46020,7],[46021,46047,8],[46048,46048,7],[46049,46075,8],[46076,46076,7],[46077,46103,8],[46104,46104,7],[46105,46131,8],[46132,46132,7],[46133,46159,8],[46160,46160,7],[46161,46187,8],[46188,46188,7],[46189,46215,8],[46216,46216,7],[46217,46243,8],[46244,46244,7],[46245,46271,8],[46272,46272,7],[46273,46299,8],[46300,46300,7],[46301,46327,8],[46328,46328,7],[46329,46355,8],[46356,46356,7],[46357,46383,8],[46384,46384,7],[46385,46411,8],[46412,46412,7],[46413,46439,8],[46440,46440,7],[46441,46467,8],[46468,46468,7],[46469,46495,8],[46496,46496,7],[46497,46523,8],[46524,46524,7],[46525,46551,8],[46552,46552,7],[46553,46579,8],[46580,46580,7],[46581,46607,8],[46608,46608,7],[46609,46635,8],[46636,46636,7],[46637,46663,8],[46664,46664,7],[46665,46691,8],[46692,46692,7],[46693,46719,8],[46720,46720,7],[46721,46747,8],[46748,46748,7],[46749,46775,8],[46776,46776,7],[46777,46803,8],[46804,46804,7],[46805,46831,8],[46832,46832,7],[46833,46859,8],[46860,46860,7],[46861,46887,8],[46888,46888,7],[46889,46915,8],[46916,46916,7],[46917,46943,8],[46944,46944,7],[46945,46971,8],[46972,46972,7],[46973,46999,8],[47000,47000,7],[47001,47027,8],[47028,47028,7],[47029,47055,8],[47056,47056,7],[47057,47083,8],[47084,47084,7],[47085,47111,8],[47112,47112,7],[47113,47139,8],[47140,47140,7],[47141,47167,8],[47168,47168,7],[47169,47195,8],[47196,47196,7],[47197,47223,8],[47224,47224,7],[47225,47251,8],[47252,47252,7],[47253,47279,8],[47280,47280,7],[47281,47307,8],[47308,47308,7],[47309,47335,8],[47336,47336,7],[47337,47363,8],[47364,47364,7],[47365,47391,8],[47392,47392,7],[47393,47419,8],[47420,47420,7],[47421,47447,8],[47448,47448,7],[47449,47475,8],[47476,47476,7],[47477,47503,8],[47504,47504,7],[47505,47531,8],[47532,47532,7],[47533,47559,8],[47560,47560,7],[47561,47587,8],[47588,47588,7],[47589,47615,8],[47616,47616,7],[47617,47643,8],[47644,47644,7],[47645,47671,8],[47672,47672,7],[47673,47699,8],[47700,47700,7],[47701,47727,8],[47728,47728,7],[47729,47755,8],[47756,47756,7],[47757,47783,8],[47784,47784,7],[47785,47811,8],[47812,47812,7],[47813,47839,8],[47840,47840,7],[47841,47867,8],[47868,47868,7],[47869,47895,8],[47896,47896,7],[47897,47923,8],[47924,47924,7],[47925,47951,8],[47952,47952,7],[47953,47979,8],[47980,47980,7],[47981,48007,8],[48008,48008,7],[48009,48035,8],[48036,48036,7],[48037,48063,8],[48064,48064,7],[48065,48091,8],[48092,48092,7],[48093,48119,8],[48120,48120,7],[48121,48147,8],[48148,48148,7],[48149,48175,8],[48176,48176,7],[48177,48203,8],[48204,48204,7],[48205,48231,8],[48232,48232,7],[48233,48259,8],[48260,48260,7],[48261,48287,8],[48288,48288,7],[48289,48315,8],[48316,48316,7],[48317,48343,8],[48344,48344,7],[48345,48371,8],[48372,48372,7],[48373,48399,8],[48400,48400,7],[48401,48427,8],[48428,48428,7],[48429,48455,8],[48456,48456,7],[48457,48483,8],[48484,48484,7],[48485,48511,8],[48512,48512,7],[48513,48539,8],[48540,48540,7],[48541,48567,8],[48568,48568,7],[48569,48595,8],[48596,48596,7],[48597,48623,8],[48624,48624,7],[48625,48651,8],[48652,48652,7],[48653,48679,8],[48680,48680,7],[48681,48707,8],[48708,48708,7],[48709,48735,8],[48736,48736,7],[48737,48763,8],[48764,48764,7],[48765,48791,8],[48792,48792,7],[48793,48819,8],[48820,48820,7],[48821,48847,8],[48848,48848,7],[48849,48875,8],[48876,48876,7],[48877,48903,8],[48904,48904,7],[48905,48931,8],[48932,48932,7],[48933,48959,8],[48960,48960,7],[48961,48987,8],[48988,48988,7],[48989,49015,8],[49016,49016,7],[49017,49043,8],[49044,49044,7],[49045,49071,8],[49072,49072,7],[49073,49099,8],[49100,49100,7],[49101,49127,8],[49128,49128,7],[49129,49155,8],[49156,49156,7],[49157,49183,8],[49184,49184,7],[49185,49211,8],[49212,49212,7],[49213,49239,8],[49240,49240,7],[49241,49267,8],[49268,49268,7],[49269,49295,8],[49296,49296,7],[49297,49323,8],[49324,49324,7],[49325,49351,8],[49352,49352,7],[49353,49379,8],[49380,49380,7],[49381,49407,8],[49408,49408,7],[49409,49435,8],[49436,49436,7],[49437,49463,8],[49464,49464,7],[49465,49491,8],[49492,49492,7],[49493,49519,8],[49520,49520,7],[49521,49547,8],[49548,49548,7],[49549,49575,8],[49576,49576,7],[49577,49603,8],[49604,49604,7],[49605,49631,8],[49632,49632,7],[49633,49659,8],[49660,49660,7],[49661,49687,8],[49688,49688,7],[49689,49715,8],[49716,49716,7],[49717,49743,8],[49744,49744,7],[49745,49771,8],[49772,49772,7],[49773,49799,8],[49800,49800,7],[49801,49827,8],[49828,49828,7],[49829,49855,8],[49856,49856,7],[49857,49883,8],[49884,49884,7],[49885,49911,8],[49912,49912,7],[49913,49939,8],[49940,49940,7],[49941,49967,8],[49968,49968,7],[49969,49995,8],[49996,49996,7],[49997,50023,8],[50024,50024,7],[50025,50051,8],[50052,50052,7],[50053,50079,8],[50080,50080,7],[50081,50107,8],[50108,50108,7],[50109,50135,8],[50136,50136,7],[50137,50163,8],[50164,50164,7],[50165,50191,8],[50192,50192,7],[50193,50219,8],[50220,50220,7],[50221,50247,8],[50248,50248,7],[50249,50275,8],[50276,50276,7],[50277,50303,8],[50304,50304,7],[50305,50331,8],[50332,50332,7],[50333,50359,8],[50360,50360,7],[50361,50387,8],[50388,50388,7],[50389,50415,8],[50416,50416,7],[50417,50443,8],[50444,50444,7],[50445,50471,8],[50472,50472,7],[50473,50499,8],[50500,50500,7],[50501,50527,8],[50528,50528,7],[50529,50555,8],[50556,50556,7],[50557,50583,8],[50584,50584,7],[50585,50611,8],[50612,50612,7],[50613,50639,8],[50640,50640,7],[50641,50667,8],[50668,50668,7],[50669,50695,8],[50696,50696,7],[50697,50723,8],[50724,50724,7],[50725,50751,8],[50752,50752,7],[50753,50779,8],[50780,50780,7],[50781,50807,8],[50808,50808,7],[50809,50835,8],[50836,50836,7],[50837,50863,8],[50864,50864,7],[50865,50891,8],[50892,50892,7],[50893,50919,8],[50920,50920,7],[50921,50947,8],[50948,50948,7],[50949,50975,8],[50976,50976,7],[50977,51003,8],[51004,51004,7],[51005,51031,8],[51032,51032,7],[51033,51059,8],[51060,51060,7],[51061,51087,8],[51088,51088,7],[51089,51115,8],[51116,51116,7],[51117,51143,8],[51144,51144,7],[51145,51171,8],[51172,51172,7],[51173,51199,8],[51200,51200,7],[51201,51227,8],[51228,51228,7],[51229,51255,8],[51256,51256,7],[51257,51283,8],[51284,51284,7],[51285,51311,8],[51312,51312,7],[51313,51339,8],[51340,51340,7],[51341,51367,8],[51368,51368,7],[51369,51395,8],[51396,51396,7],[51397,51423,8],[51424,51424,7],[51425,51451,8],[51452,51452,7],[51453,51479,8],[51480,51480,7],[51481,51507,8],[51508,51508,7],[51509,51535,8],[51536,51536,7],[51537,51563,8],[51564,51564,7],[51565,51591,8],[51592,51592,7],[51593,51619,8],[51620,51620,7],[51621,51647,8],[51648,51648,7],[51649,51675,8],[51676,51676,7],[51677,51703,8],[51704,51704,7],[51705,51731,8],[51732,51732,7],[51733,51759,8],[51760,51760,7],[51761,51787,8],[51788,51788,7],[51789,51815,8],[51816,51816,7],[51817,51843,8],[51844,51844,7],[51845,51871,8],[51872,51872,7],[51873,51899,8],[51900,51900,7],[51901,51927,8],[51928,51928,7],[51929,51955,8],[51956,51956,7],[51957,51983,8],[51984,51984,7],[51985,52011,8],[52012,52012,7],[52013,52039,8],[52040,52040,7],[52041,52067,8],[52068,52068,7],[52069,52095,8],[52096,52096,7],[52097,52123,8],[52124,52124,7],[52125,52151,8],[52152,52152,7],[52153,52179,8],[52180,52180,7],[52181,52207,8],[52208,52208,7],[52209,52235,8],[52236,52236,7],[52237,52263,8],[52264,52264,7],[52265,52291,8],[52292,52292,7],[52293,52319,8],[52320,52320,7],[52321,52347,8],[52348,52348,7],[52349,52375,8],[52376,52376,7],[52377,52403,8],[52404,52404,7],[52405,52431,8],[52432,52432,7],[52433,52459,8],[52460,52460,7],[52461,52487,8],[52488,52488,7],[52489,52515,8],[52516,52516,7],[52517,52543,8],[52544,52544,7],[52545,52571,8],[52572,52572,7],[52573,52599,8],[52600,52600,7],[52601,52627,8],[52628,52628,7],[52629,52655,8],[52656,52656,7],[52657,52683,8],[52684,52684,7],[52685,52711,8],[52712,52712,7],[52713,52739,8],[52740,52740,7],[52741,52767,8],[52768,52768,7],[52769,52795,8],[52796,52796,7],[52797,52823,8],[52824,52824,7],[52825,52851,8],[52852,52852,7],[52853,52879,8],[52880,52880,7],[52881,52907,8],[52908,52908,7],[52909,52935,8],[52936,52936,7],[52937,52963,8],[52964,52964,7],[52965,52991,8],[52992,52992,7],[52993,53019,8],[53020,53020,7],[53021,53047,8],[53048,53048,7],[53049,53075,8],[53076,53076,7],[53077,53103,8],[53104,53104,7],[53105,53131,8],[53132,53132,7],[53133,53159,8],[53160,53160,7],[53161,53187,8],[53188,53188,7],[53189,53215,8],[53216,53216,7],[53217,53243,8],[53244,53244,7],[53245,53271,8],[53272,53272,7],[53273,53299,8],[53300,53300,7],[53301,53327,8],[53328,53328,7],[53329,53355,8],[53356,53356,7],[53357,53383,8],[53384,53384,7],[53385,53411,8],[53412,53412,7],[53413,53439,8],[53440,53440,7],[53441,53467,8],[53468,53468,7],[53469,53495,8],[53496,53496,7],[53497,53523,8],[53524,53524,7],[53525,53551,8],[53552,53552,7],[53553,53579,8],[53580,53580,7],[53581,53607,8],[53608,53608,7],[53609,53635,8],[53636,53636,7],[53637,53663,8],[53664,53664,7],[53665,53691,8],[53692,53692,7],[53693,53719,8],[53720,53720,7],[53721,53747,8],[53748,53748,7],[53749,53775,8],[53776,53776,7],[53777,53803,8],[53804,53804,7],[53805,53831,8],[53832,53832,7],[53833,53859,8],[53860,53860,7],[53861,53887,8],[53888,53888,7],[53889,53915,8],[53916,53916,7],[53917,53943,8],[53944,53944,7],[53945,53971,8],[53972,53972,7],[53973,53999,8],[54000,54000,7],[54001,54027,8],[54028,54028,7],[54029,54055,8],[54056,54056,7],[54057,54083,8],[54084,54084,7],[54085,54111,8],[54112,54112,7],[54113,54139,8],[54140,54140,7],[54141,54167,8],[54168,54168,7],[54169,54195,8],[54196,54196,7],[54197,54223,8],[54224,54224,7],[54225,54251,8],[54252,54252,7],[54253,54279,8],[54280,54280,7],[54281,54307,8],[54308,54308,7],[54309,54335,8],[54336,54336,7],[54337,54363,8],[54364,54364,7],[54365,54391,8],[54392,54392,7],[54393,54419,8],[54420,54420,7],[54421,54447,8],[54448,54448,7],[54449,54475,8],[54476,54476,7],[54477,54503,8],[54504,54504,7],[54505,54531,8],[54532,54532,7],[54533,54559,8],[54560,54560,7],[54561,54587,8],[54588,54588,7],[54589,54615,8],[54616,54616,7],[54617,54643,8],[54644,54644,7],[54645,54671,8],[54672,54672,7],[54673,54699,8],[54700,54700,7],[54701,54727,8],[54728,54728,7],[54729,54755,8],[54756,54756,7],[54757,54783,8],[54784,54784,7],[54785,54811,8],[54812,54812,7],[54813,54839,8],[54840,54840,7],[54841,54867,8],[54868,54868,7],[54869,54895,8],[54896,54896,7],[54897,54923,8],[54924,54924,7],[54925,54951,8],[54952,54952,7],[54953,54979,8],[54980,54980,7],[54981,55007,8],[55008,55008,7],[55009,55035,8],[55036,55036,7],[55037,55063,8],[55064,55064,7],[55065,55091,8],[55092,55092,7],[55093,55119,8],[55120,55120,7],[55121,55147,8],[55148,55148,7],[55149,55175,8],[55176,55176,7],[55177,55203,8],[55216,55238,13],[55243,55291,12],[64286,64286,3],[65024,65039,3],[65056,65071,3],[65279,65279,2],[65438,65439,3],[65520,65531,2],[66045,66045,3],[66272,66272,3],[66422,66426,3],[68097,68099,3],[68101,68102,3],[68108,68111,3],[68152,68154,3],[68159,68159,3],[68325,68326,3],[68900,68903,3],[69291,69292,3],[69373,69375,3],[69446,69456,3],[69506,69509,3],[69632,69632,11],[69633,69633,3],[69634,69634,11],[69688,69702,3],[69744,69744,3],[69747,69748,3],[69759,69761,3],[69762,69762,11],[69808,69810,11],[69811,69814,3],[69815,69816,11],[69817,69818,3],[69821,69821,9],[69826,69826,3],[69837,69837,9],[69888,69890,3],[69927,69931,3],[69932,69932,11],[69933,69940,3],[69957,69958,11],[70003,70003,3],[70016,70017,3],[70018,70018,11],[70067,70069,11],[70070,70078,3],[70079,70080,11],[70082,70083,9],[70089,70092,3],[70094,70094,11],[70095,70095,3],[70188,70190,11],[70191,70193,3],[70194,70195,11],[70196,70196,3],[70197,70197,11],[70198,70199,3],[70206,70206,3],[70209,70209,3],[70367,70367,3],[70368,70370,11],[70371,70378,3],[70400,70401,3],[70402,70403,11],[70459,70460,3],[70462,70462,3],[70463,70463,11],[70464,70464,3],[70465,70468,11],[70471,70472,11],[70475,70477,11],[70487,70487,3],[70498,70499,11],[70502,70508,3],[70512,70516,3],[70709,70711,11],[70712,70719,3],[70720,70721,11],[70722,70724,3],[70725,70725,11],[70726,70726,3],[70750,70750,3],[70832,70832,3],[70833,70834,11],[70835,70840,3],[70841,70841,11],[70842,70842,3],[70843,70844,11],[70845,70845,3],[70846,70846,11],[70847,70848,3],[70849,70849,11],[70850,70851,3],[71087,71087,3],[71088,71089,11],[71090,71093,3],[71096,71099,11],[71100,71101,3],[71102,71102,11],[71103,71104,3],[71132,71133,3],[71216,71218,11],[71219,71226,3],[71227,71228,11],[71229,71229,3],[71230,71230,11],[71231,71232,3],[71339,71339,3],[71340,71340,11],[71341,71341,3],[71342,71343,11],[71344,71349,3],[71350,71350,11],[71351,71351,3],[71453,71455,3],[71458,71461,3],[71462,71462,11],[71463,71467,3],[71724,71726,11],[71727,71735,3],[71736,71736,11],[71737,71738,3],[71984,71984,3],[71985,71989,11],[71991,71992,11],[71995,71996,3],[71997,71997,11],[71998,71998,3],[71999,71999,9],[72000,72000,11],[72001,72001,9],[72002,72002,11],[72003,72003,3],[72145,72147,11],[72148,72151,3],[72154,72155,3],[72156,72159,11],[72160,72160,3],[72164,72164,11],[72193,72202,3],[72243,72248,3],[72249,72249,11],[72250,72250,9],[72251,72254,3],[72263,72263,3],[72273,72278,3],[72279,72280,11],[72281,72283,3],[72324,72329,9],[72330,72342,3],[72343,72343,11],[72344,72345,3],[72751,72751,11],[72752,72758,3],[72760,72765,3],[72766,72766,11],[72767,72767,3],[72850,72871,3],[72873,72873,11],[72874,72880,3],[72881,72881,11],[72882,72883,3],[72884,72884,11],[72885,72886,3],[73009,73014,3],[73018,73018,3],[73020,73021,3],[73023,73029,3],[73030,73030,9],[73031,73031,3],[73098,73102,11],[73104,73105,3],[73107,73108,11],[73109,73109,3],[73110,73110,11],[73111,73111,3],[73459,73460,3],[73461,73462,11],[73472,73473,3],[73474,73474,9],[73475,73475,11],[73524,73525,11],[73526,73530,3],[73534,73535,11],[73536,73536,3],[73537,73537,11],[73538,73538,3],[78896,78911,2],[78912,78912,3],[78919,78933,3],[92912,92916,3],[92976,92982,3],[94031,94031,3],[94033,94087,11],[94095,94098,3],[94180,94180,3],[94192,94193,11],[113821,113822,3],[113824,113827,2],[118528,118573,3],[118576,118598,3],[119141,119141,3],[119142,119142,11],[119143,119145,3],[119149,119149,11],[119150,119154,3],[119155,119162,2],[119163,119170,3],[119173,119179,3],[119210,119213,3],[119362,119364,3],[121344,121398,3],[121403,121452,3],[121461,121461,3],[121476,121476,3],[121499,121503,3],[121505,121519,3],[122880,122886,3],[122888,122904,3],[122907,122913,3],[122915,122916,3],[122918,122922,3],[123023,123023,3],[123184,123190,3],[123566,123566,3],[123628,123631,3],[124140,124143,3],[125136,125142,3],[125252,125258,3],[126976,127231,4],[127245,127247,4],[127279,127279,4],[127340,127345,4],[127358,127359,4],[127374,127374,4],[127377,127386,4],[127405,127461,4],[127462,127487,10],[127489,127503,4],[127514,127514,4],[127535,127535,4],[127538,127546,4],[127548,127551,4],[127561,127994,4],[127995,127999,3],[128000,128317,4],[128326,128591,4],[128640,128767,4],[128884,128895,4],[128981,129023,4],[129036,129039,4],[129096,129103,4],[129114,129119,4],[129160,129167,4],[129198,129279,4],[129292,129338,4],[129340,129349,4],[129351,129791,4],[130048,131069,4],[917504,917535,2],[917536,917631,3],[917632,917759,2],[917760,917999,3],[918000,921599,2]]`);

/**
 * @param {number} cp
 * @return An exact {@link GraphemeCategoryRange} if found, or garbage `start` and `from` values with {@link GC_Any} category.
 */
export function searchGraphemeCategory(cp) {
  // Perform a quick O(1) lookup in a precomputed table to determine
  // the slice of the range table to search in.
  let lookup_table = grapheme_cat_lookup;
  let lookup_interval = 0x80;

  let idx = cp / lookup_interval | 0;
  // If the `idx` is outside of the precomputed table - use the slice
  // starting from the last covered index in the precomputed table and
  // ending with the length of the range table.
  let sliceFrom = 1443, sliceTo = 1449;
  if (idx + 1 < lookup_table.length) {
    sliceFrom = lookup_table[idx];
    sliceTo = lookup_table[idx + 1] + 1;
  }

  // Compute pessimistic default lower and upper bounds on the category.
  // If character doesn't map to any range and there is no adjacent range
  // in the table slice - these bounds has to apply.
  let lower = idx * lookup_interval;
  let upper = lower + lookup_interval - 1;
  return bsearchUnicodeRange(cp, grapheme_cat_table, lower, upper, sliceFrom, sliceTo);
}
