export const inputs = {
  small: `🚀 새로운 유니코드 분할기 라이브러리 \'unicode-segmenter\'를 소개합니다! 🔍 각종 언어의 문자를 정확하게 구분해주는 강력한 도구입니다. Check it out! 👉 [https://github.com/cometkim/unicode-segmenter] #Unicode #Programming 🌐`,

  medium: `The quick brown 🦊 fox jumps over 13 lazy 🐶 dogs. हिंदी भाषा में स्वागत है. 中文环境的介绍。日本語での説明。АБВГД ЕЁЖЗ ИЙКЛМН ОПРСТ УФХЦЧ ШЩЪЫЬ ЭЮЯ. السَّلَامُ عَلَيْكُمْ. 1234567890!@# $%^&*()_+[];'./,\<>?:"{}|= abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 🌍 🚀 ✨. 𐍈𐍉𐌽𐌴𐍄𐌹𐌲𐍉𐌸𐌰𐍃𐌰𐍂𐌺𐍃 𐌲𐌴𐍂𐌰𐌼𐌰𐌽𐌹𐍃𐌺𐌰𐌹𐍃𐌰𐍂𐌰𐌶𐌳𐌰. 🧙‍♂️⚔️🏰👸🐉🏹🛡️🌌. ¡Hola! ¿Cómo estás? 🎉🎊🎈. Dans un village de La Mancha, dont je ne veux pas me souvenir du nom, vivait pas si longtemps, un hidalgo des lances reposées, ancien bouclier, cheval maigre et lévrier rapide. O Romeo, Romeo! wherefore art thou Romeo? Deny thy father and refuse thy name; Or, if thou wilt not, be but sworn my love, And I'll no longer be a Capulet. 세계의 모든 인간은 자유롭고 평등하게 태어났다. 人人生而自由，在尊严和权利上一律平等。Είναι ελεύθεροι και ίσοι στην αξιοπρέπεια και τα δικαιώματα. כָּל אָדָם נוֹלָד חוֹפְשִׁי וּשְׁוֵה בַּכָּבוֹד וּבַזְּכוּיוֹת.`,
};

/**
 * @param {number} nums
 * @param {() => void} callback
 */
export function simpleBench(nums, callback) {
  // warmup
  for (let i = 0; i < 100; i++) {
    void callback();
  }

  let startAt = Date.now();
  for (let i = 0; i < nums; i++) {
    void callback();
  }
  let endAt = Date.now();
  let totalDuration = endAt - startAt;
  let avgDuration = totalDuration / nums;

  return {
    samples: nums,
    startAt,
    endAt,
    totalDuration,
    avgDuration,
  };
}
