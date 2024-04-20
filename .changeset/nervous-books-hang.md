---
"unicode-segmenter": minor
---

Optimize perf again 🔥

It can be still getting faster, why not?

Through seriously thoughtful micro-optimizations, it has achieved performance improvements of up to ~30% (404ns -> 310ns) in the previously used simple emoji joiner test.

Now it use more realistic benchmark with various types of input text. In most cases, `unicode-segmenter` is 7~15 times faster than other competing libraries.

For example, here a Tweet-like text ChatGPT generated:

```
🚀 새로운 유니코드 분할기 라이브러리 \'unicode-segmenter\'를 소개합니다! 🔍 각종 언어의 문자를 정확하게 구분해주는 강력한 도구입니다. Check it out! 👉 [https://github.com/cometkim/unicode-segmenter] #Unicode #Programming 🌐
```

And the result then:

```
cpu: Apple M1 Pro
runtime: node v21.7.1 (arm64-darwin)

                       time (avg)             (min … max)       p75       p99      p999
--------------------------------------------------------- -----------------------------
unicode-segmenter   7'850 ns/iter   (7'753 ns … 8'122 ns)  7'877 ns  8'079 ns  8'122 ns
Intl.Segmenter     60'581 ns/iter    (57'916 ns … 405 µs) 59'167 ns 66'458 ns    358 µs
graphemer          66'303 ns/iter    (64'708 ns … 287 µs) 65'500 ns 73'459 ns    206 µs
grapheme-splitter     146 µs/iter       (143 µs … 466 µs)    145 µs    157 µs    397 µs

summary
  unicode-segmenter
   7.72x faster than Intl.Segmenter
   8.45x faster than graphemer
   18.6x faster than grapheme-splitter
```
