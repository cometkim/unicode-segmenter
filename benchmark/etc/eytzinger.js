import {
  bench,
  run,
  do_not_optimize,
} from 'mitata';

import { eytzingerLayout } from '#src/core.js';

import { emoji_presentation_ranges, extended_pictographic_ranges } from '#src/_emoji_data.js';
import { letter_ranges, numeric_ranges, alphabetic_ranges } from '#src/_general_data.js';
import { grapheme_ranges } from '#src/_grapheme_data.js';
import { consonant_ranges } from '#src/_incb_data.js';

bench('eytzinger Emoji_Presentation', () => {
  do_not_optimize(eytzingerLayout(emoji_presentation_ranges));
});

bench('eytzinger Extended_Pictographic', () => {
  do_not_optimize(eytzingerLayout(extended_pictographic_ranges));
});

bench('eytzinger Letter', () => {
  do_not_optimize(eytzingerLayout(letter_ranges));
});

bench('eytzinger Alphanumeric', () => {
  do_not_optimize(eytzingerLayout(numeric_ranges) && eytzingerLayout(alphabetic_ranges));
});

bench('eytzinger Grapheme breaks', () => {
  do_not_optimize(eytzingerLayout(grapheme_ranges) && eytzingerLayout(consonant_ranges));
});

await run();
