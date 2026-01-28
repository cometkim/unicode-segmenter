import * as assert from 'node:assert/strict';
import {
  group,
  summary,
  barplot,
  bench,
  run,
  do_not_optimize,
} from 'mitata';

import Graphemer from 'graphemer';
import GraphemeSplitter from 'grapheme-splitter';
import * as unicodeSegmentation from 'unicode-segmentation-wasm';
import { Segmenter as FormatjsSegmenter } from '@formatjs/intl-segmenter/segmenter.js';

import { graphemeSegments } from '../../src/grapheme.js';

// Node.js, Deno, Bun
const isSystemRuntime = typeof process === 'object' || typeof Deno === 'object' && typeof Bun === 'object';
const isWebWorker = !isSystemRuntime && typeof self === 'object';

if (isWebWorker) {
  // Init WASM module
  await unicodeSegmentation.default();
}

const intlSegmenter = new Intl.Segmenter();
const graphemer = new (Graphemer.default || Graphemer)();
const graphemeSplitter = new (GraphemeSplitter.default || GraphemeSplitter)();
const formatjsSegmenter = new FormatjsSegmenter();

let testcases = [
  [
    'Lorem ipsum (ascii)',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  ],
  [
    'Emojis',
    '🌟📚✨🎉🚀🌍🎈🌸🍀🌻🎨💖🐾🍒🔮🍕🌙🌈🐢🍉💡📅🎶🎮🔥💤💼🚲🌼🔒💧💫',
  ],
  [
    'Hindi',
    'राधा अपने बगीचे में फूलों को पानी देते हुए पक्षियों की चहचहाहट सुन रही थी, और वह सोच रही थी कि आज का दिन कितना शांत और सुंदर है।',
  ],
  [
    'Demonic characters',
    'Z͑ͫ̓ͪ̂ͫ̽͏̴̙̤̞͉͚̯̞̠͍A̴̵̜̰͔ͫ͗͢L̠ͨͧͩ͘G̴̻͈͍͔̹̑͗̎̅͛́Ǫ̵̹̻̝̳͂̌̌͘!͖̬̰̙̗̿̋ͥͥ̂ͣ̐́́͜͞',
  ],
  [
    'Tweet text (combined)',
    '🚀 새로운 유니코드 분할기 라이브러리 \'unicode-segmenter\'를 소개합니다! 🔍 각종 언어의 문자를 정확하게 구분해주는 강력한 도구입니다. Check it out! 👉 [https://github.com/cometkim/unicode-segmenter] #Unicode #Programming 🌐',
  ],
  [
    'Code snippet (combined)',
    `
// 'unicode-segmenter' 라이브러리를 사용한 유니코드 문자 분할 예제 코드 🚀

// ESM supported!
import { graphemeSegments } from 'unicode-segmenter/grapheme';

// 문자열을 유니코드 그래핌 단위로 분할하는 함수 예시
function 문자분할테스트(문자열) {
  const 분할된문자들 = [...graphemeSegments(문자열)].map(({ segment }) => segment);
  console.log("분할된 유니코드 문자들:", 분할된문자들);
}

// 테스트 문자열
const 테스트문자열 = "안녕하세요! Welcome to the unicode-segementer library 📚";
문자분할테스트(테스트문자열);
`,
  ],
];

for (const [title, input] of testcases) {
  const expected = [...intlSegmenter.segment(input)].map(({ segment }) => segment);

  if (isSystemRuntime) {
    assert.deepEqual([...graphemeSegments(input)].map(({ segment }) => segment), expected);
    assert.deepEqual([...formatjsSegmenter.segment(input)].map(({ segment }) => segment), expected);

    // They don't support Unicode 15.1
    // assert.deepEqual([...graphemer.iterateGraphemes(input)], expected);
    // assert.deepEqual([...graphemeSplitter.iterateGraphemes(input)], expected);
    // assert.deepEqual([...unicodeSegmentation.collect(input)], expected);
  }

  group(title, () => {
    summary(() => {
      barplot(() => {
        bench('unicode-segmenter/grapheme', () => {
          do_not_optimize([...graphemeSegments(input)]);
        }).gc('inner').baseline(true);

        bench('graphemer', () => {
          do_not_optimize([...graphemer.iterateGraphemes(input)]);
        }).gc('inner');

        bench('grapheme-splitter', () => {
          do_not_optimize([...graphemeSplitter.iterateGraphemes(input)]);
        }).gc('inner');

        bench('@formatjs/intl-segmenter', () => {
          do_not_optimize([...formatjsSegmenter.segment(input)]);
        }).gc('inner');

        bench('unicode-rs/unicode-segmentation (wasm-bindgen)', () => {
          do_not_optimize(unicodeSegmentation.collect(input));
        }).gc('inner');

        bench('Intl.Segmenter', () => {
          do_not_optimize([...intlSegmenter.segment(input)]);
        }).gc('inner');
      });
    });
  });
}

await run({
  format: (!isWebWorker && process.env.MITATA_FORMAT) || 'mitata',
  ...isWebWorker && {
    colors: false,
    print(s) {
      self.postMessage({ type: 'log', message: s });
    },
  },
  ...isSystemRuntime && {
    colors: !process.env.NO_COLOR,
  },
});

if (isWebWorker) {
  self.postMessage({ type: 'done' });
}
