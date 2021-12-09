---
title: "ユークリッドの互除法を Canvas で可視化する"
emoji: "🙆"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["math", "JavaScript", "TypeScript", "Canvas"]
published: true
---

# 概要

最近 Creative Coding を学び始めました。
まだまだ初歩の初歩レベルですが、数学的な思考を求められることもあり、なかなか頭の体操になって楽しいです。
**ユークリッドの互除法**を可視化すると面白いらしいということで、実際にやってみました。

# ユーグリットの互除法とは

困ったときの wikipedia さん。

https://ja.wikipedia.org/w/index.php?curid=7942

> ユークリッドの互除法（ユークリッドのごじょほう、英: Euclidean Algorithm）は、2 つの自然数の最大公約数を求める手法の一つである。

この通りですね。2 つの自然数から最大公約数を求めるアルゴリズムのことです。

## 手順

自然数 a, b (a >= b)に対して、以下のような手順を踏みます。

1. a を b で割り、余り c1 を求める
2. b を c1 で割り、余り c2 を求める
3. c1 を c2 で割り、余り c3 を求める
4. この操作を余りが 0 になるまで繰り返し、余りが 0 になった時の**割る数**が最大公約数となる

## 具体例

自然数 20 と 12 に対してユークリッドの互除法をやってみます。

```
20 ÷ 12 = 1 ... 8
12 ÷ 8 = 1 ... 4
8 ÷ 4 = 2 ... 0 //余りが 0 になったので終わり

余りが 0 になった時の割る数は 4 なので最大公約数は 4
```

やってみるとそれほど難しくはありませんね。

# TypeScript に置き換える

ユークリッドの互除法を `TypeScript` で表現してみます。

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

長辺の長さを a
短辺の長さを b
とした長方形を考える

長方形から一辺の長さが b である正方形を c 個埋めると、
長辺が b, 短辺が d の長方形が残る
```

図に書いてみるとこんな感じ。

![ユークリッドの互除法図解](/images/20211117/euclidean-algorithm.png)

残った長方形に対して、また同じことを繰り返していくと、いずれ余り（上記画像の d）が 0 になるので、全てが正方形で埋まることになりますね。

すなわち、ユークリッドの互除法を使うことによって**長方形を正方形に分割できる**ということです。

# Canvas に描写する

ここまでくればあとは Canvas に描写してみるだけですね。

@[codepen](https://codepen.io/yend24/pen/RwZXMWY)

:::details TypeScript コード

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

ユークリッドの互除法を可視化する方法でした。
基礎中の基礎ではありますが、数学の力を借りることによって、面白い表現ができるのだなと感動しました。
Creative Coding や数学を学んでいくことによって、より面白い表現ができるようになりたいと思います。
