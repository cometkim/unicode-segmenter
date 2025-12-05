import { withCodSpeed } from '@codspeed/tinybench-plugin';
import { Bench } from 'tinybench';

import { graphemeSegments } from '../../src/grapheme.js';

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

const bench = withCodSpeed(new Bench());

for (const [name, input] of testcases) {
  bench.add(`grapheme - ${name}`, () => {
    void [...graphemeSegments(input)];
  });
}

await bench.run();
console.table(bench.table());
