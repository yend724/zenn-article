---
title: '【CSS】transform の matrix を理解したい'
emoji: '⛳'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['css']
published: false
---

CSS の `transform` プロパティの [`matrix()`](https://developer.mozilla.org/ja/docs/Web/CSS/transform-function/matrix) および [`matrix3d()`](https://developer.mozilla.org/ja/docs/Web/CSS/transform-function/matrix3d) がよく分からない。

:::message
本記事は CSS の`matrix関数`を理解することを目的としており、数学の行列については詳しく解説はしません（というよりできません）。
:::

## transform プロパティとは

https://developer.mozilla.org/ja/docs/Web/CSS/transform

> transform は CSS のプロパティで、与えられた要素を回転、拡大縮小、傾斜、移動することできます。

MDN に書かれているように `transform` プロパティを使用することで**要素に回転、拡大縮小、傾斜(または歪曲)、移動の座標変換を適用する**ことができます。`transform` プロパティ自体は広く使われるプロパティであり、普段 CSS と関わりがあり馴染み深い方も多いのではないでしょうか。

これらの座標変換は `translate()` / `scale()` / `rotate()` / `skew()` などの CSS 関数で簡単に実現することができ、実際に筆者の経験上においても前述した CSS 関数が広く使われているように思えます。

一方で本記事の主題である `matrix()` が使われている機会があまり多くはなく、筆者自身も案件で使ったことはありません。MDN の説明を読んでみても、正直よくわからんと感じる人も少なくないかと思います。

## 行列（`matrix`）

「matrix」は日本語で数学の「行列」という意味を持ちます。

https://ja.wikipedia.org/wiki/%E8%A1%8C%E5%88%97

> 数学の線型代数学周辺分野における行列（ぎょうれつ、英: matrix）は、数や記号や式などを縦と横に矩形状に配列したものである。

行列は数字を縦横の格子状に並べたものであり、横方向を **行(row)**、縦方向を **列(column)** と呼びます。例えば、下記のような行列は 2 つの行と 3 つの列によって構成されており、2×3 型の行列です。

$$
  \left[
    \begin{array}{cc}
      1 & 2 & 3 \\
      4 & 5 & 6
    \end{array}
  \right]
$$

この行列という概念は色々な分野で使用されるようですが、CSS の `transform` プロパティでは座標変換の計算として行列を使用します。

CSS では X,Y,Z の三次元空間にて座標変換を適用できますが、まずは X,Y の二次元について考え、その後三次元に拡張したいと思います。

### 二次元の座標変換 `matrix()`

まず X,Y の二次元で考えてみましょう。

#### 平行移動

@[codepen](https://codepen.io/yend24/pen/RwvewWZ)

#### 拡大縮小

@[codepen](https://codepen.io/yend24/pen/BaMqaRO)

#### 回転

@[codepen](https://codepen.io/yend24/pen/bGzmGoO)

#### 傾斜

@[codepen](https://codepen.io/yend24/pen/RwvewLQ)

### 三次元の座標変換 `matrix3d()`

次に X,Y,Z の三次元に拡張して考えてみます。

#### 平行移動

@[codepen](https://codepen.io/yend24/pen/abXRbaJ)

## ユースケース

正直よくわかりません。アニメーションライブラリの開発などで役に立つケースがあるかもしれないです。

## おわりに

## 参考

https://drafts.csswg.org/css-transforms-2/
https://developer.mozilla.org/ja/docs/Web/CSS/transform-function
https://developer.mozilla.org/ja/docs/Web/API/WebGL_API/Matrix_math_for_the_web
https://amzn.asia/d/2jB3088
http://matrixmultiplication.xyz/
