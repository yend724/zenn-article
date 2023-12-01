---
title: '【CSS】transform の matrix って何ですか？'
emoji: '⛳'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['css']
published: false
---

CSS の `transform` プロパティの [`matrix()`](https://developer.mozilla.org/ja/docs/Web/CSS/transform-function/matrix) および [`matrix3d()`](https://developer.mozilla.org/ja/docs/Web/CSS/transform-function/matrix3d) がよく分からないので学び直しました。

:::message
本記事は CSS の`matrix関数`を理解することを目的としており、数学の行列については詳しく解説はしません（というよりできません）。
:::

## `transform`プロパティとは？

https://developer.mozilla.org/ja/docs/Web/CSS/transform

> transform は CSS のプロパティで、与えられた要素を回転、拡大縮小、傾斜、移動することできます。

MDN に書かれているように `transform` プロパティを使用することで**要素に回転、拡大縮小、傾斜(または歪曲)、移動の座標変換を適用する**ことができます。`transform` プロパティ自体は広く使われるプロパティであり、普段 CSS と関わりがあり馴染み深い方も多いのではないでしょうか。

これらの座標変換は `translate()` / `scale()` / `rotate()` / `skew()` などの CSS 関数で簡単に実現することができ、実際に筆者の経験上においても前述した CSS 関数が広く使われているように思えます。

一方で本記事の主題である `matrix関数` が使われる機会はあまり多くなく、筆者自身も案件で使ったことはありません。MDN の説明を読んでみても、正直よくわからんと感じる人も少なくないかと思います。

## 行列（`matrix`）とは？

「`matrix`」は日本語で数学の「行列」という意味を持ちます。

https://ja.wikipedia.org/wiki/%E8%A1%8C%E5%88%97

> 数学の線型代数学周辺分野における行列（ぎょうれつ、英: matrix）は、数や記号や式などを縦と横に矩形状に配列したものである。

つまり行列は数字を縦横の格子状に並べたものです。この時、横方向を **行(row)**、縦方向を **列(column)** と呼びます。

$$
\begin{bmatrix}
    1 & 2 & 3 \\
    4 & 5 & 6
\end{bmatrix}
$$

https://developer.mozilla.org/ja/docs/Web/API/WebGL_API/Matrix_math_for_the_web

> 行列は、空間内のオブジェクトの変換を表すために使用でき、画像を構築したり、ウェブ上でデータを視覚化したりするときに、多くの主要な種類の計算を実行するために使用されます。

行列という概念は色々な分野で使用されるようですが、CSS の`matrix関数`では座標変換の計算に行列を使用します。

## 行列を使った座標変換ってどうやるの？

CSSの`matrix関数`を使うことで、行列を使った座標変換が行えるのだなということがわかりました。とはいえ「行列を使った座標変換ってどうやるの？」ということはまだ分かっていません。



### 二次元（X,Y）の変換

#### 単位行列

$$
E =
\begin{bmatrix}
  1 & 0 & 0 \\
  0 & 1 & 0 \\
  0 & 0 & 1
\end{bmatrix}
$$

#### 平行移動

$$
\begin{bmatrix}
  x' \\
  y' \\
  w'
\end{bmatrix}
=
\begin{bmatrix}
  1 & 0 & tx \\
  0 & 1 & ty \\
  0 & 0 & 1
\end{bmatrix}
\times
\begin{bmatrix}
  x \\
  y \\
  1
\end{bmatrix}
$$

$$
x' = x \times 1 + y \times 0 + 1 \times tx = x + tx \\
y' = x \times 0 + y \times 1 + 1 \times ty = y + ty \\
w' = x \times 0 + y \times 0 + 1 \times 1 = 1
$$

$$
\begin{bmatrix}
  x + tx \\
  y + ty \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  1 & 0 & tx \\
  0 & 1 & ty \\
  0 & 0 & 1
\end{bmatrix}
\times
\begin{bmatrix}
  x \\
  y \\
  1
\end{bmatrix}
$$

#### 拡大縮小

$$
\begin{bmatrix}
  x' \\
  y' \\
  w'
\end{bmatrix}
=
\begin{bmatrix}
  sx & 0 & 0 \\
  0 & sy & 0 \\
  0 & 0 & 1
\end{bmatrix}
\times
\begin{bmatrix}
  x \\
  y \\
  1
\end{bmatrix}
$$

$$
x' = x \times sx + y \times 0 + 1 \times 0 = x \times sx \\
y' = x \times 0 + y \times sy + 1 \times 0 = y \times sy \\
w' = x \times 0 + y \times 0 + 1 \times 1 = 1
$$

$$
\begin{bmatrix}
  x \times sx \\
  y \times sy \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  sx & 0 & 0 \\
  0 & sy & 0 \\
  0 & 0 & 1
\end{bmatrix}
\times
\begin{bmatrix}
  x \\
  y \\
  1
\end{bmatrix}
$$

## `matrix()` を使ってみる

### 平行移動

@[codepen](https://codepen.io/yend24/pen/RwvewWZ)

### 拡大縮小

@[codepen](https://codepen.io/yend24/pen/BaMqaRO)

### 回転

@[codepen](https://codepen.io/yend24/pen/bGzmGoO)

### 傾斜

@[codepen](https://codepen.io/yend24/pen/RwvewLQ)

## `matrix3d()`　を使ってみる

### 平行移動

@[codepen](https://codepen.io/yend24/pen/abXRbaJ)

### 回転

@[codepen](https://codepen.io/yend24/pen/xxMyLGX)

## ユースケース

正直よくわかりません。アニメーションライブラリの開発などで役に立つケースがあるかもしれないです。

## おわりに

## 参考

https://drafts.csswg.org/css-transforms-2/
https://developer.mozilla.org/ja/docs/Web/CSS/transform-function
https://developer.mozilla.org/ja/docs/Web/API/WebGL_API/Matrix_math_for_the_web
https://amzn.asia/d/2jB3088
http://matrixmultiplication.xyz/
