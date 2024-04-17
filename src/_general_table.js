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

import { bsearchRange } from './core.js';

/**
 * @typedef {import('./core.js').UnicodeRange} UnicodeRange
 */

/**
 * @type {UnicodeRange[]}
 */
const letter_table = [
  [65, 90], [97, 122], [170, 170], [181, 181], [186, 186], [192, 214], [216, 246], [248, 705], [710,
  721], [736, 740], [748, 748], [750, 750], [880, 884], [886, 887], [890, 893], [895, 895], [902,
  902], [904, 906], [908, 908], [910, 929], [931, 1013], [1015, 1153], [1162, 1327], [1329, 1366],
  [1369, 1369], [1376, 1416], [1488, 1514], [1519, 1522], [1568, 1610], [1646, 1647], [1649, 1747],
  [1749, 1749], [1765, 1766], [1774, 1775], [1786, 1788], [1791, 1791], [1808, 1808], [1810, 1839],
  [1869, 1957], [1969, 1969], [1994, 2026], [2036, 2037], [2042, 2042], [2048, 2069], [2074, 2074],
  [2084, 2084], [2088, 2088], [2112, 2136], [2144, 2154], [2160, 2183], [2185, 2190], [2208, 2249],
  [2308, 2361], [2365, 2365], [2384, 2384], [2392, 2401], [2417, 2432], [2437, 2444], [2447, 2448],
  [2451, 2472], [2474, 2480], [2482, 2482], [2486, 2489], [2493, 2493], [2510, 2510], [2524, 2525],
  [2527, 2529], [2544, 2545], [2556, 2556], [2565, 2570], [2575, 2576], [2579, 2600], [2602, 2608],
  [2610, 2611], [2613, 2614], [2616, 2617], [2649, 2652], [2654, 2654], [2674, 2676], [2693, 2701],
  [2703, 2705], [2707, 2728], [2730, 2736], [2738, 2739], [2741, 2745], [2749, 2749], [2768, 2768],
  [2784, 2785], [2809, 2809], [2821, 2828], [2831, 2832], [2835, 2856], [2858, 2864], [2866, 2867],
  [2869, 2873], [2877, 2877], [2908, 2909], [2911, 2913], [2929, 2929], [2947, 2947], [2949, 2954],
  [2958, 2960], [2962, 2965], [2969, 2970], [2972, 2972], [2974, 2975], [2979, 2980], [2984, 2986],
  [2990, 3001], [3024, 3024], [3077, 3084], [3086, 3088], [3090, 3112], [3114, 3129], [3133, 3133],
  [3160, 3162], [3165, 3165], [3168, 3169], [3200, 3200], [3205, 3212], [3214, 3216], [3218, 3240],
  [3242, 3251], [3253, 3257], [3261, 3261], [3293, 3294], [3296, 3297], [3313, 3314], [3332, 3340],
  [3342, 3344], [3346, 3386], [3389, 3389], [3406, 3406], [3412, 3414], [3423, 3425], [3450, 3455],
  [3461, 3478], [3482, 3505], [3507, 3515], [3517, 3517], [3520, 3526], [3585, 3632], [3634, 3635],
  [3648, 3654], [3713, 3714], [3716, 3716], [3718, 3722], [3724, 3747], [3749, 3749], [3751, 3760],
  [3762, 3763], [3773, 3773], [3776, 3780], [3782, 3782], [3804, 3807], [3840, 3840], [3904, 3911],
  [3913, 3948], [3976, 3980], [4096, 4138], [4159, 4159], [4176, 4181], [4186, 4189], [4193, 4193],
  [4197, 4198], [4206, 4208], [4213, 4225], [4238, 4238], [4256, 4293], [4295, 4295], [4301, 4301],
  [4304, 4346], [4348, 4680], [4682, 4685], [4688, 4694], [4696, 4696], [4698, 4701], [4704, 4744],
  [4746, 4749], [4752, 4784], [4786, 4789], [4792, 4798], [4800, 4800], [4802, 4805], [4808, 4822],
  [4824, 4880], [4882, 4885], [4888, 4954], [4992, 5007], [5024, 5109], [5112, 5117], [5121, 5740],
  [5743, 5759], [5761, 5786], [5792, 5866], [5873, 5880], [5888, 5905], [5919, 5937], [5952, 5969],
  [5984, 5996], [5998, 6000], [6016, 6067], [6103, 6103], [6108, 6108], [6176, 6264], [6272, 6276],
  [6279, 6312], [6314, 6314], [6320, 6389], [6400, 6430], [6480, 6509], [6512, 6516], [6528, 6571],
  [6576, 6601], [6656, 6678], [6688, 6740], [6823, 6823], [6917, 6963], [6981, 6988], [7043, 7072],
  [7086, 7087], [7098, 7141], [7168, 7203], [7245, 7247], [7258, 7293], [7296, 7304], [7312, 7354],
  [7357, 7359], [7401, 7404], [7406, 7411], [7413, 7414], [7418, 7418], [7424, 7615], [7680, 7957],
  [7960, 7965], [7968, 8005], [8008, 8013], [8016, 8023], [8025, 8025], [8027, 8027], [8029, 8029],
  [8031, 8061], [8064, 8116], [8118, 8124], [8126, 8126], [8130, 8132], [8134, 8140], [8144, 8147],
  [8150, 8155], [8160, 8172], [8178, 8180], [8182, 8188], [8305, 8305], [8319, 8319], [8336, 8348],
  [8450, 8450], [8455, 8455], [8458, 8467], [8469, 8469], [8473, 8477], [8484, 8484], [8486, 8486],
  [8488, 8488], [8490, 8493], [8495, 8505], [8508, 8511], [8517, 8521], [8526, 8526], [8579, 8580],
  [11264, 11492], [11499, 11502], [11506, 11507], [11520, 11557], [11559, 11559], [11565, 11565],
  [11568, 11623], [11631, 11631], [11648, 11670], [11680, 11686], [11688, 11694], [11696, 11702],
  [11704, 11710], [11712, 11718], [11720, 11726], [11728, 11734], [11736, 11742], [11823, 11823],
  [12293, 12294], [12337, 12341], [12347, 12348], [12353, 12438], [12445, 12447], [12449, 12538],
  [12540, 12543], [12549, 12591], [12593, 12686], [12704, 12735], [12784, 12799], [13312, 19903],
  [19968, 42124], [42192, 42237], [42240, 42508], [42512, 42527], [42538, 42539], [42560, 42606],
  [42623, 42653], [42656, 42725], [42775, 42783], [42786, 42888], [42891, 42954], [42960, 42961],
  [42963, 42963], [42965, 42969], [42994, 43009], [43011, 43013], [43015, 43018], [43020, 43042],
  [43072, 43123], [43138, 43187], [43250, 43255], [43259, 43259], [43261, 43262], [43274, 43301],
  [43312, 43334], [43360, 43388], [43396, 43442], [43471, 43471], [43488, 43492], [43494, 43503],
  [43514, 43518], [43520, 43560], [43584, 43586], [43588, 43595], [43616, 43638], [43642, 43642],
  [43646, 43695], [43697, 43697], [43701, 43702], [43705, 43709], [43712, 43712], [43714, 43714],
  [43739, 43741], [43744, 43754], [43762, 43764], [43777, 43782], [43785, 43790], [43793, 43798],
  [43808, 43814], [43816, 43822], [43824, 43866], [43868, 43881], [43888, 44002], [44032, 55203],
  [55216, 55238], [55243, 55291], [63744, 64109], [64112, 64217], [64256, 64262], [64275, 64279],
  [64285, 64285], [64287, 64296], [64298, 64310], [64312, 64316], [64318, 64318], [64320, 64321],
  [64323, 64324], [64326, 64433], [64467, 64829], [64848, 64911], [64914, 64967], [65008, 65019],
  [65136, 65140], [65142, 65276], [65313, 65338], [65345, 65370], [65382, 65470], [65474, 65479],
  [65482, 65487], [65490, 65495], [65498, 65500], [65536, 65547], [65549, 65574], [65576, 65594],
  [65596, 65597], [65599, 65613], [65616, 65629], [65664, 65786], [66176, 66204], [66208, 66256],
  [66304, 66335], [66349, 66368], [66370, 66377], [66384, 66421], [66432, 66461], [66464, 66499],
  [66504, 66511], [66560, 66717], [66736, 66771], [66776, 66811], [66816, 66855], [66864, 66915],
  [66928, 66938], [66940, 66954], [66956, 66962], [66964, 66965], [66967, 66977], [66979, 66993],
  [66995, 67001], [67003, 67004], [67072, 67382], [67392, 67413], [67424, 67431], [67456, 67461],
  [67463, 67504], [67506, 67514], [67584, 67589], [67592, 67592], [67594, 67637], [67639, 67640],
  [67644, 67644], [67647, 67669], [67680, 67702], [67712, 67742], [67808, 67826], [67828, 67829],
  [67840, 67861], [67872, 67897], [67968, 68023], [68030, 68031], [68096, 68096], [68112, 68115],
  [68117, 68119], [68121, 68149], [68192, 68220], [68224, 68252], [68288, 68295], [68297, 68324],
  [68352, 68405], [68416, 68437], [68448, 68466], [68480, 68497], [68608, 68680], [68736, 68786],
  [68800, 68850], [68864, 68899], [69248, 69289], [69296, 69297], [69376, 69404], [69415, 69415],
  [69424, 69445], [69488, 69505], [69552, 69572], [69600, 69622], [69635, 69687], [69745, 69746],
  [69749, 69749], [69763, 69807], [69840, 69864], [69891, 69926], [69956, 69956], [69959, 69959],
  [69968, 70002], [70006, 70006], [70019, 70066], [70081, 70084], [70106, 70106], [70108, 70108],
  [70144, 70161], [70163, 70187], [70207, 70208], [70272, 70278], [70280, 70280], [70282, 70285],
  [70287, 70301], [70303, 70312], [70320, 70366], [70405, 70412], [70415, 70416], [70419, 70440],
  [70442, 70448], [70450, 70451], [70453, 70457], [70461, 70461], [70480, 70480], [70493, 70497],
  [70656, 70708], [70727, 70730], [70751, 70753], [70784, 70831], [70852, 70853], [70855, 70855],
  [71040, 71086], [71128, 71131], [71168, 71215], [71236, 71236], [71296, 71338], [71352, 71352],
  [71424, 71450], [71488, 71494], [71680, 71723], [71840, 71903], [71935, 71942], [71945, 71945],
  [71948, 71955], [71957, 71958], [71960, 71983], [71999, 71999], [72001, 72001], [72096, 72103],
  [72106, 72144], [72161, 72161], [72163, 72163], [72192, 72192], [72203, 72242], [72250, 72250],
  [72272, 72272], [72284, 72329], [72349, 72349], [72368, 72440], [72704, 72712], [72714, 72750],
  [72768, 72768], [72818, 72847], [72960, 72966], [72968, 72969], [72971, 73008], [73030, 73030],
  [73056, 73061], [73063, 73064], [73066, 73097], [73112, 73112], [73440, 73458], [73474, 73474],
  [73476, 73488], [73490, 73523], [73648, 73648], [73728, 74649], [74880, 75075], [77712, 77808],
  [77824, 78895], [78913, 78918], [82944, 83526], [92160, 92728], [92736, 92766], [92784, 92862],
  [92880, 92909], [92928, 92975], [92992, 92995], [93027, 93047], [93053, 93071], [93760, 93823],
  [93952, 94026], [94032, 94032], [94099, 94111], [94176, 94177], [94179, 94179], [94208, 100343],
  [100352, 101589], [101632, 101640], [110576, 110579], [110581, 110587], [110589, 110590], [110592,
  110882], [110898, 110898], [110928, 110930], [110933, 110933], [110948, 110951], [110960, 111355],
  [113664, 113770], [113776, 113788], [113792, 113800], [113808, 113817], [119808, 119892], [119894,
  119964], [119966, 119967], [119970, 119970], [119973, 119974], [119977, 119980], [119982, 119993],
  [119995, 119995], [119997, 120003], [120005, 120069], [120071, 120074], [120077, 120084], [120086,
  120092], [120094, 120121], [120123, 120126], [120128, 120132], [120134, 120134], [120138, 120144],
  [120146, 120485], [120488, 120512], [120514, 120538], [120540, 120570], [120572, 120596], [120598,
  120628], [120630, 120654], [120656, 120686], [120688, 120712], [120714, 120744], [120746, 120770],
  [120772, 120779], [122624, 122654], [122661, 122666], [122928, 122989], [123136, 123180], [123191,
  123197], [123214, 123214], [123536, 123565], [123584, 123627], [124112, 124139], [124896, 124902],
  [124904, 124907], [124909, 124910], [124912, 124926], [124928, 125124], [125184, 125251], [125259,
  125259], [126464, 126467], [126469, 126495], [126497, 126498], [126500, 126500], [126503, 126503],
  [126505, 126514], [126516, 126519], [126521, 126521], [126523, 126523], [126530, 126530], [126535,
  126535], [126537, 126537], [126539, 126539], [126541, 126543], [126545, 126546], [126548, 126548],
  [126551, 126551], [126553, 126553], [126555, 126555], [126557, 126557], [126559, 126559], [126561,
  126562], [126564, 126564], [126567, 126570], [126572, 126578], [126580, 126583], [126585, 126588],
  [126590, 126590], [126592, 126601], [126603, 126619], [126625, 126627], [126629, 126633], [126635,
  126651], [131072, 173791], [173824, 177977], [177984, 178205], [178208, 183969], [183984, 191456],
  [191472, 192093], [194560, 195101], [196608, 201546], [201552, 205743],
];

/**
 * @type {UnicodeRange[]}
 */
const numeric_table = [
  [48, 57], [178, 179], [185, 185], [188, 190], [1632, 1641], [1776, 1785], [1984, 1993], [2406,
  2415], [2534, 2543], [2548, 2553], [2662, 2671], [2790, 2799], [2918, 2927], [2930, 2935], [3046,
  3058], [3174, 3183], [3192, 3198], [3302, 3311], [3416, 3422], [3430, 3448], [3558, 3567], [3664,
  3673], [3792, 3801], [3872, 3891], [4160, 4169], [4240, 4249], [4969, 4988], [5870, 5872], [6112,
  6121], [6128, 6137], [6160, 6169], [6470, 6479], [6608, 6618], [6784, 6793], [6800, 6809], [6992,
  7001], [7088, 7097], [7232, 7241], [7248, 7257], [8304, 8304], [8308, 8313], [8320, 8329], [8528,
  8578], [8581, 8585], [9312, 9371], [9450, 9471], [10102, 10131], [11517, 11517], [12295, 12295],
  [12321, 12329], [12344, 12346], [12690, 12693], [12832, 12841], [12872, 12879], [12881, 12895],
  [12928, 12937], [12977, 12991], [42528, 42537], [42726, 42735], [43056, 43061], [43216, 43225],
  [43264, 43273], [43472, 43481], [43504, 43513], [43600, 43609], [44016, 44025], [65296, 65305],
  [65799, 65843], [65856, 65912], [65930, 65931], [66273, 66299], [66336, 66339], [66369, 66369],
  [66378, 66378], [66513, 66517], [66720, 66729], [67672, 67679], [67705, 67711], [67751, 67759],
  [67835, 67839], [67862, 67867], [68028, 68029], [68032, 68047], [68050, 68095], [68160, 68168],
  [68221, 68222], [68253, 68255], [68331, 68335], [68440, 68447], [68472, 68479], [68521, 68527],
  [68858, 68863], [68912, 68921], [69216, 69246], [69405, 69414], [69457, 69460], [69573, 69579],
  [69714, 69743], [69872, 69881], [69942, 69951], [70096, 70105], [70113, 70132], [70384, 70393],
  [70736, 70745], [70864, 70873], [71248, 71257], [71360, 71369], [71472, 71483], [71904, 71922],
  [72016, 72025], [72784, 72812], [73040, 73049], [73120, 73129], [73552, 73561], [73664, 73684],
  [74752, 74862], [92768, 92777], [92864, 92873], [93008, 93017], [93019, 93025], [93824, 93846],
  [119488, 119507], [119520, 119539], [119648, 119672], [120782, 120831], [123200, 123209], [123632,
  123641], [124144, 124153], [125127, 125135], [125264, 125273], [126065, 126123], [126125, 126127],
  [126129, 126132], [126209, 126253], [126255, 126269], [127232, 127244], [130032, 130041],
];

/**
 * @type {UnicodeRange[]}
 */
const alphabetic_table = [
  [65, 90], [97, 122], [170, 170], [181, 181], [186, 186], [192, 214], [216, 246], [248, 705], [710,
  721], [736, 740], [748, 748], [750, 750], [837, 837], [880, 884], [886, 887], [890, 893], [895,
  895], [902, 902], [904, 906], [908, 908], [910, 929], [931, 1013], [1015, 1153], [1162, 1327],
  [1329, 1366], [1369, 1369], [1376, 1416], [1456, 1469], [1471, 1471], [1473, 1474], [1476, 1477],
  [1479, 1479], [1488, 1514], [1519, 1522], [1552, 1562], [1568, 1623], [1625, 1631], [1646, 1747],
  [1749, 1756], [1761, 1768], [1773, 1775], [1786, 1788], [1791, 1791], [1808, 1855], [1869, 1969],
  [1994, 2026], [2036, 2037], [2042, 2042], [2048, 2071], [2074, 2092], [2112, 2136], [2144, 2154],
  [2160, 2183], [2185, 2190], [2208, 2249], [2260, 2271], [2275, 2281], [2288, 2363], [2365, 2380],
  [2382, 2384], [2389, 2403], [2417, 2435], [2437, 2444], [2447, 2448], [2451, 2472], [2474, 2480],
  [2482, 2482], [2486, 2489], [2493, 2500], [2503, 2504], [2507, 2508], [2510, 2510], [2519, 2519],
  [2524, 2525], [2527, 2531], [2544, 2545], [2556, 2556], [2561, 2563], [2565, 2570], [2575, 2576],
  [2579, 2600], [2602, 2608], [2610, 2611], [2613, 2614], [2616, 2617], [2622, 2626], [2631, 2632],
  [2635, 2636], [2641, 2641], [2649, 2652], [2654, 2654], [2672, 2677], [2689, 2691], [2693, 2701],
  [2703, 2705], [2707, 2728], [2730, 2736], [2738, 2739], [2741, 2745], [2749, 2757], [2759, 2761],
  [2763, 2764], [2768, 2768], [2784, 2787], [2809, 2812], [2817, 2819], [2821, 2828], [2831, 2832],
  [2835, 2856], [2858, 2864], [2866, 2867], [2869, 2873], [2877, 2884], [2887, 2888], [2891, 2892],
  [2902, 2903], [2908, 2909], [2911, 2915], [2929, 2929], [2946, 2947], [2949, 2954], [2958, 2960],
  [2962, 2965], [2969, 2970], [2972, 2972], [2974, 2975], [2979, 2980], [2984, 2986], [2990, 3001],
  [3006, 3010], [3014, 3016], [3018, 3020], [3024, 3024], [3031, 3031], [3072, 3084], [3086, 3088],
  [3090, 3112], [3114, 3129], [3133, 3140], [3142, 3144], [3146, 3148], [3157, 3158], [3160, 3162],
  [3165, 3165], [3168, 3171], [3200, 3203], [3205, 3212], [3214, 3216], [3218, 3240], [3242, 3251],
  [3253, 3257], [3261, 3268], [3270, 3272], [3274, 3276], [3285, 3286], [3293, 3294], [3296, 3299],
  [3313, 3315], [3328, 3340], [3342, 3344], [3346, 3386], [3389, 3396], [3398, 3400], [3402, 3404],
  [3406, 3406], [3412, 3415], [3423, 3427], [3450, 3455], [3457, 3459], [3461, 3478], [3482, 3505],
  [3507, 3515], [3517, 3517], [3520, 3526], [3535, 3540], [3542, 3542], [3544, 3551], [3570, 3571],
  [3585, 3642], [3648, 3654], [3661, 3661], [3713, 3714], [3716, 3716], [3718, 3722], [3724, 3747],
  [3749, 3749], [3751, 3769], [3771, 3773], [3776, 3780], [3782, 3782], [3789, 3789], [3804, 3807],
  [3840, 3840], [3904, 3911], [3913, 3948], [3953, 3971], [3976, 3991], [3993, 4028], [4096, 4150],
  [4152, 4152], [4155, 4159], [4176, 4239], [4250, 4253], [4256, 4293], [4295, 4295], [4301, 4301],
  [4304, 4346], [4348, 4680], [4682, 4685], [4688, 4694], [4696, 4696], [4698, 4701], [4704, 4744],
  [4746, 4749], [4752, 4784], [4786, 4789], [4792, 4798], [4800, 4800], [4802, 4805], [4808, 4822],
  [4824, 4880], [4882, 4885], [4888, 4954], [4992, 5007], [5024, 5109], [5112, 5117], [5121, 5740],
  [5743, 5759], [5761, 5786], [5792, 5866], [5870, 5880], [5888, 5907], [5919, 5939], [5952, 5971],
  [5984, 5996], [5998, 6000], [6002, 6003], [6016, 6067], [6070, 6088], [6103, 6103], [6108, 6108],
  [6176, 6264], [6272, 6314], [6320, 6389], [6400, 6430], [6432, 6443], [6448, 6456], [6480, 6509],
  [6512, 6516], [6528, 6571], [6576, 6601], [6656, 6683], [6688, 6750], [6753, 6772], [6823, 6823],
  [6847, 6848], [6860, 6862], [6912, 6963], [6965, 6979], [6981, 6988], [7040, 7081], [7084, 7087],
  [7098, 7141], [7143, 7153], [7168, 7222], [7245, 7247], [7258, 7293], [7296, 7304], [7312, 7354],
  [7357, 7359], [7401, 7404], [7406, 7411], [7413, 7414], [7418, 7418], [7424, 7615], [7655, 7668],
  [7680, 7957], [7960, 7965], [7968, 8005], [8008, 8013], [8016, 8023], [8025, 8025], [8027, 8027],
  [8029, 8029], [8031, 8061], [8064, 8116], [8118, 8124], [8126, 8126], [8130, 8132], [8134, 8140],
  [8144, 8147], [8150, 8155], [8160, 8172], [8178, 8180], [8182, 8188], [8305, 8305], [8319, 8319],
  [8336, 8348], [8450, 8450], [8455, 8455], [8458, 8467], [8469, 8469], [8473, 8477], [8484, 8484],
  [8486, 8486], [8488, 8488], [8490, 8493], [8495, 8505], [8508, 8511], [8517, 8521], [8526, 8526],
  [8544, 8584], [9398, 9449], [11264, 11492], [11499, 11502], [11506, 11507], [11520, 11557],
  [11559, 11559], [11565, 11565], [11568, 11623], [11631, 11631], [11648, 11670], [11680, 11686],
  [11688, 11694], [11696, 11702], [11704, 11710], [11712, 11718], [11720, 11726], [11728, 11734],
  [11736, 11742], [11744, 11775], [11823, 11823], [12293, 12295], [12321, 12329], [12337, 12341],
  [12344, 12348], [12353, 12438], [12445, 12447], [12449, 12538], [12540, 12543], [12549, 12591],
  [12593, 12686], [12704, 12735], [12784, 12799], [13312, 19903], [19968, 42124], [42192, 42237],
  [42240, 42508], [42512, 42527], [42538, 42539], [42560, 42606], [42612, 42619], [42623, 42735],
  [42775, 42783], [42786, 42888], [42891, 42954], [42960, 42961], [42963, 42963], [42965, 42969],
  [42994, 43013], [43015, 43047], [43072, 43123], [43136, 43203], [43205, 43205], [43250, 43255],
  [43259, 43259], [43261, 43263], [43274, 43306], [43312, 43346], [43360, 43388], [43392, 43442],
  [43444, 43455], [43471, 43471], [43488, 43503], [43514, 43518], [43520, 43574], [43584, 43597],
  [43616, 43638], [43642, 43710], [43712, 43712], [43714, 43714], [43739, 43741], [43744, 43759],
  [43762, 43765], [43777, 43782], [43785, 43790], [43793, 43798], [43808, 43814], [43816, 43822],
  [43824, 43866], [43868, 43881], [43888, 44010], [44032, 55203], [55216, 55238], [55243, 55291],
  [63744, 64109], [64112, 64217], [64256, 64262], [64275, 64279], [64285, 64296], [64298, 64310],
  [64312, 64316], [64318, 64318], [64320, 64321], [64323, 64324], [64326, 64433], [64467, 64829],
  [64848, 64911], [64914, 64967], [65008, 65019], [65136, 65140], [65142, 65276], [65313, 65338],
  [65345, 65370], [65382, 65470], [65474, 65479], [65482, 65487], [65490, 65495], [65498, 65500],
  [65536, 65547], [65549, 65574], [65576, 65594], [65596, 65597], [65599, 65613], [65616, 65629],
  [65664, 65786], [65856, 65908], [66176, 66204], [66208, 66256], [66304, 66335], [66349, 66378],
  [66384, 66426], [66432, 66461], [66464, 66499], [66504, 66511], [66513, 66517], [66560, 66717],
  [66736, 66771], [66776, 66811], [66816, 66855], [66864, 66915], [66928, 66938], [66940, 66954],
  [66956, 66962], [66964, 66965], [66967, 66977], [66979, 66993], [66995, 67001], [67003, 67004],
  [67072, 67382], [67392, 67413], [67424, 67431], [67456, 67461], [67463, 67504], [67506, 67514],
  [67584, 67589], [67592, 67592], [67594, 67637], [67639, 67640], [67644, 67644], [67647, 67669],
  [67680, 67702], [67712, 67742], [67808, 67826], [67828, 67829], [67840, 67861], [67872, 67897],
  [67968, 68023], [68030, 68031], [68096, 68099], [68101, 68102], [68108, 68115], [68117, 68119],
  [68121, 68149], [68192, 68220], [68224, 68252], [68288, 68295], [68297, 68324], [68352, 68405],
  [68416, 68437], [68448, 68466], [68480, 68497], [68608, 68680], [68736, 68786], [68800, 68850],
  [68864, 68903], [69248, 69289], [69291, 69292], [69296, 69297], [69376, 69404], [69415, 69415],
  [69424, 69445], [69488, 69505], [69552, 69572], [69600, 69622], [69632, 69701], [69745, 69749],
  [69760, 69816], [69826, 69826], [69840, 69864], [69888, 69938], [69956, 69959], [69968, 70002],
  [70006, 70006], [70016, 70079], [70081, 70084], [70094, 70095], [70106, 70106], [70108, 70108],
  [70144, 70161], [70163, 70196], [70199, 70199], [70206, 70209], [70272, 70278], [70280, 70280],
  [70282, 70285], [70287, 70301], [70303, 70312], [70320, 70376], [70400, 70403], [70405, 70412],
  [70415, 70416], [70419, 70440], [70442, 70448], [70450, 70451], [70453, 70457], [70461, 70468],
  [70471, 70472], [70475, 70476], [70480, 70480], [70487, 70487], [70493, 70499], [70656, 70721],
  [70723, 70725], [70727, 70730], [70751, 70753], [70784, 70849], [70852, 70853], [70855, 70855],
  [71040, 71093], [71096, 71102], [71128, 71133], [71168, 71230], [71232, 71232], [71236, 71236],
  [71296, 71349], [71352, 71352], [71424, 71450], [71453, 71466], [71488, 71494], [71680, 71736],
  [71840, 71903], [71935, 71942], [71945, 71945], [71948, 71955], [71957, 71958], [71960, 71989],
  [71991, 71992], [71995, 71996], [71999, 72002], [72096, 72103], [72106, 72151], [72154, 72159],
  [72161, 72161], [72163, 72164], [72192, 72242], [72245, 72254], [72272, 72343], [72349, 72349],
  [72368, 72440], [72704, 72712], [72714, 72758], [72760, 72766], [72768, 72768], [72818, 72847],
  [72850, 72871], [72873, 72886], [72960, 72966], [72968, 72969], [72971, 73014], [73018, 73018],
  [73020, 73021], [73023, 73025], [73027, 73027], [73030, 73031], [73056, 73061], [73063, 73064],
  [73066, 73102], [73104, 73105], [73107, 73110], [73112, 73112], [73440, 73462], [73472, 73488],
  [73490, 73530], [73534, 73536], [73648, 73648], [73728, 74649], [74752, 74862], [74880, 75075],
  [77712, 77808], [77824, 78895], [78913, 78918], [82944, 83526], [92160, 92728], [92736, 92766],
  [92784, 92862], [92880, 92909], [92928, 92975], [92992, 92995], [93027, 93047], [93053, 93071],
  [93760, 93823], [93952, 94026], [94031, 94087], [94095, 94111], [94176, 94177], [94179, 94179],
  [94192, 94193], [94208, 100343], [100352, 101589], [101632, 101640], [110576, 110579], [110581,
  110587], [110589, 110590], [110592, 110882], [110898, 110898], [110928, 110930], [110933, 110933],
  [110948, 110951], [110960, 111355], [113664, 113770], [113776, 113788], [113792, 113800], [113808,
  113817], [113822, 113822], [119808, 119892], [119894, 119964], [119966, 119967], [119970, 119970],
  [119973, 119974], [119977, 119980], [119982, 119993], [119995, 119995], [119997, 120003], [120005,
  120069], [120071, 120074], [120077, 120084], [120086, 120092], [120094, 120121], [120123, 120126],
  [120128, 120132], [120134, 120134], [120138, 120144], [120146, 120485], [120488, 120512], [120514,
  120538], [120540, 120570], [120572, 120596], [120598, 120628], [120630, 120654], [120656, 120686],
  [120688, 120712], [120714, 120744], [120746, 120770], [120772, 120779], [122624, 122654], [122661,
  122666], [122880, 122886], [122888, 122904], [122907, 122913], [122915, 122916], [122918, 122922],
  [122928, 122989], [123023, 123023], [123136, 123180], [123191, 123197], [123214, 123214], [123536,
  123565], [123584, 123627], [124112, 124139], [124896, 124902], [124904, 124907], [124909, 124910],
  [124912, 124926], [124928, 125124], [125184, 125251], [125255, 125255], [125259, 125259], [126464,
  126467], [126469, 126495], [126497, 126498], [126500, 126500], [126503, 126503], [126505, 126514],
  [126516, 126519], [126521, 126521], [126523, 126523], [126530, 126530], [126535, 126535], [126537,
  126537], [126539, 126539], [126541, 126543], [126545, 126546], [126548, 126548], [126551, 126551],
  [126553, 126553], [126555, 126555], [126557, 126557], [126559, 126559], [126561, 126562], [126564,
  126564], [126567, 126570], [126572, 126578], [126580, 126583], [126585, 126588], [126590, 126590],
  [126592, 126601], [126603, 126619], [126625, 126627], [126629, 126633], [126635, 126651], [127280,
  127305], [127312, 127337], [127344, 127369], [131072, 173791], [173824, 177977], [177984, 178205],
  [178208, 183969], [183984, 191456], [191472, 192093], [194560, 195101], [196608, 201546], [201552,
  205743],
];

/**
 * Check if the given code point is included in Unicode \p{L} general property
 *
 * @param {number} cp
 * @return boolean
 */
export function isLetter(cp) {
  return bsearchRange(cp, letter_table) >= 0;
}

/**
 * Check if the given code point is included in Unicode \p{Alphabetic} dervied property
 *
 * @param {number} cp
 * @return boolean
 */
export function isAlphabetic(cp) {
  return bsearchRange(cp, alphabetic_table) >= 0;
}

/**
 * Check if the given code point is included in Unicode \p{N} general property
 *
 * @param {number} cp
 * @return boolean true if 
 */
export function isNumeric(cp) {
  return bsearchRange(cp, numeric_table) >= 0;
}

/**
 * @param {number} cp
 * @return boolean true
 */
export function isAlphanumeric(cp) {
  return isAlphabetic(cp) || isNumeric(cp);
}
