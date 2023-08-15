---
title: "ユークリッドの互除法をCanvasで可視化する"
emoji: "🙆"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["math", "JavaScript", "TypeScript", "Canvas"]
published: true
---

# 概要

最近Creative Codingを学び始めました。まだまだ初歩の初歩レベルですが、数学的な思考を求められることもあり、なかなか頭の体操になって楽しいです。

**ユークリッドの互除法**を可視化するとおもしろいらしいということで、実際にやってみました。

# ユーグリットの互除法とは

困ったときのwikipediaさん。

https://ja.wikipedia.org/w/index.php?curid=7942

> ユークリッドの互除法（ユークリッドのごじょほう、英: Euclidean Algorithm）は、2 つの自然数の最大公約数を求める手法の一つである。

この通りですね。2つの自然数から最大公約数を求めるアルゴリズムのことです。

## 手順

自然数a, b (a >= b)に対して、以下のような手順を踏みます。

1. aをbで割り、余りc1を求める
2. bをc1で割り、余りc2を求める
3. c1をc2で割り、余りc3を求める
4. この操作を余りが0になるまで繰り返し、余りが0になった時の**割る数**が最大公約数となる

## 具体例

自然数20と12に対してユークリッドの互除法をやってみます。

```
20 ÷ 12 = 1 ... 8
12 ÷ 8 = 1 ... 4
8 ÷ 4 = 2 ... 0 //余りが 0 になったので終わり

余りが 0 になった時の割る数は 4 なので最大公約数は 4
```

やってみるとそれほど難しくはありませんね。

# TypeScriptに置き換える

ユークリッドの互除法を`TypeScript`で表現してみます。

```ts
// 自然数　a, b(a > b)を準備
let a = 20;
let b = 12;

while (b > 0) {
  const c = Math.floor(a / b); // 商
  const d = a % b; // 余り
  console.log(a + "÷" + b + "=" + c + "..." + d);
  a = b;
  b = d;
}

/*
実行結果
20÷12=1...8
12÷8=1...4
8÷4=2...0
*/
```

完璧ですね。

# 図形的に考えてみる

ユークリッドの互除法を図形的に考えてみます。

```
a ÷ b = c ... d が何を表しているのか

長辺の長さをa
短辺の長さをb
とした長方形を考える

長方形から一辺の長さがbである正方形をc個埋めると、
長辺がb, 短辺がdの長方形が残る
```

図に書いてみるとこんな感じ。

![ユークリッドの互除法図解](/images/20211116/euclidean-algorithm.png)

残った長方形に対して、また同じことを繰り返していくと、いずれ余り（上記画像のd）が0になるので、すべてが正方形で埋まることになりますね。

すなわち、ユークリッドの互除法を使うことによって**長方形を正方形に分割できる**ということです。

# Canvasに描写する

ここまでくればあとはCanvasに描写してみるだけですね。

@[codepen](https://codepen.io/yend24/pen/RwZXMWY)

:::details TypeScriptコード

```ts
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const context = canvas.getContext("2d")!;

let n1 = 56; // 自然数（大きい）
let n2 = 36; // 自然数(小さい)
const scale = Math.floor((window.innerWidth / n1) * 0.8); // 長方形の大きさを決めるための係数。windowの横幅の0.8倍に調整
n1 = n1 * scale;
n2 = n2 * scale;

canvas.width = n1;
canvas.height = n2;
context.fillStyle = "#ccc";
context.fillRect(0, 0, n1, n2);

let a = n1;
let b = n2;

let posX = 0,
  posY = 0;

let count = 0; //横に分割するか縦に分割するか決めるためのカウンタ
while (b > 0) {
  const c = Math.floor(a / b); // 商
  const d = a % b; // 余り
  // 商の数だけ正方形が取得できる
  for (let i = 0; i < c; i++) {
    context.fillStyle = `rgb(${Math.floor(Math.random() * 256)},${Math.floor(
      Math.random() * 256
    )},${Math.floor(Math.random() * 256)})`;
    context.fillRect(posX, posY, b, b);
    if (count % 2 === 0) {
      // count　が　2　で割り切れる時は横に分割
      posX += b;
    } else {
      // count　が　2　で割り切れない時は縦に分割
      posY += b;
    }
  }
  a = b;
  b = d;
  count++;
}
```

:::

綺麗に長方形を正方形で分割することができました。

# まとめ

ユークリッドの互除法を可視化する方法でした。基礎中の基礎ではありますが、数学の力を借りることによって、おもしろい表現ができるのだなと感動しました。Creative Codingや数学を学んでいくことによって、よりおもしろい表現ができるようになりたいと思います。
