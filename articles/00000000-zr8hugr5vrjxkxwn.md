---
title: '【CSS】transform の matrix って何ですか？'
emoji: '⛳'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['css']
published: false
---

CSSの`transform`プロパティの [`matrix()`](https://developer.mozilla.org/ja/docs/Web/CSS/transform-function/matrix)および[`matrix3d()`](https://developer.mozilla.org/ja/docs/Web/CSS/transform-function/matrix3d) がよく分からないので学び直しました。

:::message
本記事はCSSの`matrix関数`を理解することを目的としており、数学の行列については詳しく解説はしません（というよりできません）。
:::

## `transform`プロパティとは

https://developer.mozilla.org/ja/docs/Web/CSS/transform

> transform は CSS のプロパティで、与えられた要素を回転、拡大縮小、傾斜、移動することできます。

MDNに書かれているように`transform`プロパティを使用することで**要素に平行移動、拡大縮小、回転、の座標変換を適用する**ことができます。`transform`プロパティ自体は広く使われるプロパティであり、普段CSSと関わりがあり馴染み深い方も多いのではないでしょうか。

これらの座標変換は`translate関数`、`scale関数`、`rotate関数`、`skew関数`などのCSS関数で簡単に実現することができ、実際に筆者の経験上においても前述したCSS関数が広く使われているように思えます。

一方で本記事の主題である`matrix関数`が使われる機会はあまり多くなく、筆者自身も案件で使ったことはありません。MDNの説明を読んでみても、正直よくわからないと感じる人も少なくはないかと思います。

## 行列（`matrix`）とは

「`matrix`」は日本語で数学における「行列」という意味を持ちます。

https://ja.wikipedia.org/wiki/%E8%A1%8C%E5%88%97

> 数学の線型代数学周辺分野における行列（ぎょうれつ、英: matrix）は、数や記号や式などを縦と横に矩形状に配列したものである。

*Wikipedia*を読んでみると上記のように書かれています。つまり行列は数字を縦横の矩形状に並べたものです。この時、横方向を**行**、縦方向を**列**と呼びます。

$$
\begin{bmatrix}
    1 & 2 & 3 \\
    4 & 5 & 6
\end{bmatrix}
$$

https://developer.mozilla.org/ja/docs/Web/API/WebGL_API/Matrix_math_for_the_web

> 行列は、空間内のオブジェクトの変換を表すために使用でき、画像を構築したり、ウェブ上でデータを視覚化したりするときに、多くの主要な種類の計算を実行するために使用されます。

行列という概念はさまざまな分野で使用されるようですが、CSSの`matrix関数`では座標変換の計算に行列を使用します。実の所、`matrix関数`を使うことで`translate関数`、`scale関数`、`rotate関数`、`skew関数`など他のCSS座標変換関数を代替することも可能です。

## 行列を使った座標変換のイメージ

`matrix関数`を使うことで行列を用いた座標変換が行えることがわかりましたが、まだどのように行列を使うのかイメージが湧きませんね。ここでは簡単に流れを確認してみます。

### 座標変換と変換行列

座標変換では、座標に何かしらの行列を乗算することで回転、拡大縮小、傾斜、移動のような変換を適用します。この何かしらの行列のことを変換行列と呼びます。

たとえば（x、y）の座標に変換行列`[?]`を乗算して、新たな（x′, y′）の座標を取得したいときは以下のような式で表現できます。

$$
\begin{bmatrix}
  x' \\
  y' \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  ?
\end{bmatrix}
\times
\begin{bmatrix}
  x \\
  y \\
  1
\end{bmatrix}
$$

上記の式を見てみるとなにやら不思議な箇所がありますね。`x`、`y`（および`x′`、`y′`）まではわかりますが、`1`はどこから出てきたのでしょうか。これは同次座標系と呼ばれるものです。

### 同次座標系

同次座標系はN次元の座標系に対し、次元が1つ多いN+1次元の座標系です。たとえば2次元平面上の座標（x,y）を同次座標系で表すと（x,y,w）、3次元空間上の座標（x,y,z）を同次座標系で表すと（x,y,z,w）となります。また通常このwは1に設定されます（前述の式でも1に設定しています）。

なぜ同次座標系（つまりN+1次元の座標系）を使うのかというと、計算上都合がいいからです。同次座標系を使うことで平行移動、拡大縮小、回転などの座標変換を一度の乗算で計算できるようになります。

:::message
あくまで計算がしやすいというだけで同次座標系を使用せずとも座標変換自体は可能です。
:::

### 座標と行列の乗算

ここで座標と行列の乗算について簡単に確認しておきます。

$$
\begin{bmatrix}
  x' \\
  y' \\
  w'
\end{bmatrix}
=
\begin{bmatrix}
  m00 & m01 & m02 \\
  m10 & m11 & m12 \\
  m20 & m21 & m22
\end{bmatrix}
\times
\begin{bmatrix}
  x \\
  y \\
  w
\end{bmatrix}
$$

上記のような座標と変換行列で乗算を行う場合、変換後の座標（x′, y′, w′）はそれぞれ次のように計算されます。

$$
x' = x \times m00 + y \times m01 + w \times m02 \\
y' = x \times m10 + y \times m11 + w \times m12 \\
w' = x \times m20 + y \times m21 + w \times m22
$$

変換行列の「行」と座標の各々の要素を乗算し、それらすべてを足し合わせています。以下のような形の方がわかりやすいかもしれません。

$$
\begin{bmatrix}
  x' \\
  y' \\
  w'
\end{bmatrix}
=
\begin{bmatrix}
  x \times m00 + y \times m01 + w \times m02 \\
  x \times m10 + y \times m11 + w \times m12 \\
  x \times m20 + y \times m21 + w \times m22
\end{bmatrix}
$$

また計算方法で気付いた方もいるかもしれませんが、行列Aと行列Bで乗算するためには行列Aの列数と行列Bの行数が等しい必要があります。つまり座標が（x,y,w）の3次元であれば、変換行列は3列になります。ちなみに本記事で出てくる変換行列は2次元平面の場合は3×3型、3次元空間の場合は4×4型です。

行列の乗算のイメージがわかない方は[Matrix Multiplication](http://matrixmultiplication.xyz/)というサイトで、乗算の動きが可視化されているので一度確認してみると理解の手助けになるかもしれません。


## 4つの変換行列と座標変換

さて、ここでは平行移動、拡大縮小、回転、傾斜の4つの座標変換とその変換行列についてもう少し確認してみましょう。これらの座標変換はCSSの`translate関数`、`scale関数`、`rotate関数`、`skew関数`にあたるものです。

CSSでは3次元空間において座標変換を適用することが可能なので、原則として3次元空間上で考えていきます。ただし、傾斜（`skew関数`）に関しては2次元平面を対象としているので、2次元平面上で考えます。

### 平行移動

平行移動の変換行列は以下になります。

$$
\begin{bmatrix}
  1 & 0 & 0 & tx \\
  0 & 1 & 0 & ty \\
  0 & 0 & 1 & tz \\
  0 & 0 & 0 & 1
\end{bmatrix}
$$

`tx`、`ty`, `tz`はそれぞれX軸、Y軸、Z軸における移動量です。したがって平行移動の計算は以下のようになります。

$$
\begin{bmatrix}
  x' \\
  y' \\
  z' \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  1 & 0 & 0 & tx \\
  0 & 1 & 0 & ty \\
  0 & 0 & 1 & tz \\
  0 & 0 & 0 & 1
\end{bmatrix}
\times
\begin{bmatrix}
  x \\
  y \\
  z \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  x + tx \\
  y + ty \\
  z + tz \\
  1
\end{bmatrix}
$$


### 拡大縮小

拡大縮小の変換行列は以下になります。

$$
\begin{bmatrix}
  sx & 0 & 0 & 0 \\
  0 & sy & 0 & 0 \\
  0 & 0 & sz & 0 \\
  0 & 0 & 0 & 1
\end{bmatrix}
$$

`sx`、`sy`, `sz`はそれぞれX軸、Y軸、Z軸における拡大縮小率です。したがって拡大縮小の計算は以下のようになります。

$$
\begin{bmatrix}
  x' \\
  y' \\
  z' \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  sx & 0 & 0 & 0 \\
  0 & sy & 0 & 0 \\
  0 & 0 & sz & 0 \\
  0 & 0 & 0 & 1
\end{bmatrix}
\times
\begin{bmatrix}
  x \\
  y \\
  z \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  x \times sx \\
  y \times sy \\
  z \times sz \\
  1
\end{bmatrix}
$$

### 回転

回転の座標変換はX軸、Y軸、Z軸のそれぞれの軸について変換行列を考えます。

#### X軸回転

X軸回転の変換行列は以下になります。

$$
\begin{bmatrix}
  1 & 0 & 0 & 0 \\
  0 & \cos{\theta} & -\sin{\theta} & 0 \\
  0 & \sin{\theta} & \cos{\theta} & 0 \\
  0 & 0 & 0 & 1
\end{bmatrix}
$$

したがってX軸回転の計算は以下のようになります。

$$
\begin{bmatrix}
  x' \\
  y' \\
  z' \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  1 & 0 & 0 & 0 \\
  0 & \cos{\theta} & -\sin{\theta} & 0 \\
  0 & \sin{\theta} & \cos{\theta} & 0 \\
  0 & 0 & 0 & 1
\end{bmatrix}
\times
\begin{bmatrix}
  x \\
  y \\
  z \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  x \\
  y \times \cos{\theta} - z \times \sin{\theta} \\
  y \times \sin{\theta} + z \times \cos{\theta} \\
  1
\end{bmatrix}
$$

#### Y軸回転

Y軸回転の変換行列は以下になります。

$$
\begin{bmatrix}
  \cos{\theta} & 0 & \sin{\theta} & 0 \\
  0 & 1 & 0 & 0 \\
  -\sin{\theta} & 0 & \cos{\theta} & 0 \\
  0 & 0 & 0 & 1
\end{bmatrix}
$$

したがってY軸回転の計算は以下のようになります。

$$
\begin{bmatrix}
  x' \\
  y' \\
  z' \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  \cos{\theta} & 0 & \sin{\theta} & 0 \\
  0 & 1 & 0 & 0 \\
  -\sin{\theta} & 0 & \cos{\theta} & 0 \\
  0 & 0 & 0 & 1
\end{bmatrix}
\times
\begin{bmatrix}
  x \\
  y \\
  z \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  x \times \cos{\theta} + z \times \sin{\theta} \\
  y \\
  -x \times \sin{\theta} + z \times \cos{\theta} \\
  1
\end{bmatrix}
$$

#### Z軸回転

Z軸回転の変換行列は以下になります。

$$
\begin{bmatrix}
  \cos{\theta} & -\sin{\theta} & 0 & 0 \\
  \sin{\theta} & \cos{\theta} & 0 & 0 \\
  0 & 0 & 1 & 0 \\
  0 & 0 & 0 & 1
\end{bmatrix}
$$

したがってZ軸回転の計算は以下のようになります。

$$
\begin{bmatrix}
  x' \\
  y' \\
  z' \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  \cos{\theta} & -\sin{\theta} & 0 & 0 \\
  \sin{\theta} & \cos{\theta} & 0 & 0 \\
  0 & 0 & 1 & 0 \\
  0 & 0 & 0 & 1
\end{bmatrix}
\times
\begin{bmatrix}
  x \\
  y \\
  z \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  x \times \cos{\theta} - y \times \sin{\theta} \\
  x \times \sin{\theta} + y \times \cos{\theta} \\
  z \\
  1
\end{bmatrix}
$$

### 傾斜

傾斜の変換行列は以下になります。

$$
\begin{bmatrix}
  1 & \tan{\theta} & 0 \\
  \tan{\theta} & 1 & 0 \\
  0 & 0& 1
\end{bmatrix}
$$

したがって傾斜の計算は以下のようになります。

$$
\begin{bmatrix}
  x' \\
  y' \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  1 & \tan{\theta} & 0 \\
  \tan{\theta} & 1 & 0 \\
  0 & 0& 1
\end{bmatrix}
\times
\begin{bmatrix}
  x \\
  y \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  x + y \times \tan{\theta} \\
  x \times \tan{\theta} + y \\
  1
\end{bmatrix}
$$

## おわりに

## 参考

https://drafts.csswg.org/css-transforms-2/
https://developer.mozilla.org/ja/docs/Web/CSS/transform-function
https://amzn.asia/d/2jB3088
