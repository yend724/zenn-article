---
title: '【CSS】transformのmatrixって何ですか？'
emoji: '⛳'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['css']
published: true
published_at: 2023-12-15 12:00
---

:::message
本記事は[CSS Advent Calendar 2023](https://qiita.com/advent-calendar/2023/cascading_style_sheets)の15日目の記事になります。
:::
:::message
本記事はCSSの`matrix関数`を把握すること、または使用できるようにすることを目的としています。数学の行列については詳しく解説しません（というよりできません）。
:::

CSSの`transform`プロパティにおける`matrix関数`（[matrix()](https://developer.mozilla.org/ja/docs/Web/CSS/transform-function/matrix)および[matrix3d()](https://developer.mozilla.org/ja/docs/Web/CSS/transform-function/matrix3d)）について書いていきます。

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

*Wikipedia*には上記のように書かれています。つまり行列は数字を縦横の矩形状に並べたものです。この時、横方向を**行**、縦方向を**列**と呼びます。

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

座標変換では、座標に何かしらの行列を乗算することで回転、拡大縮小、傾斜、移動のような何かしらの変換を適用します。この何かしらの行列のことを「変換行列」と呼びます。

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

行列の乗算のイメージが湧かない方は[Matrix Multiplication](http://matrixmultiplication.xyz/)というサイトで、乗算の動きが可視化されているので一度確認してみると理解の手助けになるかもしれません。


## 4つの変換行列と座標変換

さて、ここでは平行移動、拡大縮小、回転、傾斜の4つの座標変換とその変換行列についてもう少し確認してみましょう。これらの座標変換はCSSの`translate関数`、`scale関数`、`rotate関数`、`skew関数`にあたるものです。

CSSでは3次元空間において座標変換を適用することが可能なので、原則として3次元の座標（x,y,z）で考えていきます。ただし、傾斜（`skew関数`）に関しては2次元の座標（x,y）を対象としているので、2次元の座標のみを考えます。

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

![三次元空間で正六面体が平行移動している図](/images/20231215/translate.png)

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

![三次元空間で正六面体が拡大している図](/images/20231215/scale.png)

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

![三次元空間で正六面体がX軸に対して回転している図](/images/20231215/rotateX.png)

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

![三次元空間で正六面体がY軸に対して回転している図](/images/20231215/rotateY.png)

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

![三次元空間で正六面体がZ軸に対して回転している図](/images/20231215/rotateZ.png)

### 傾斜

:::message
CSSの`skew関数`は他の座標変換関数（`translate関数`や`scale関数`など）と異なり、2次元の座標を対象としているので、傾斜については2次元で考えます。
:::

傾斜の変換行列は以下になります。2次元における同次座標系なので3×3型の変換行列になることに注意してください。

$$
\begin{bmatrix}
  1 & \tan{\theta}\small x & 0 \\
  \tan{\theta}\small y & 1 & 0 \\
  0 & 0& 1
\end{bmatrix}
$$

`tanθx`および`tanθy`はそれぞれX軸、Y軸に対応しています。したがって傾斜の計算は以下のようになります。

$$
\begin{bmatrix}
  x' \\
  y' \\
  1
\end{bmatrix}
=
\begin{bmatrix}
  1 & \tan{\theta}\small x & 0 \\
  \tan{\theta}\small y & 1 & 0 \\
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
  x + y \times \tan{\theta}\small x \\
  x \times \tan{\theta}\small y + y \\
  1
\end{bmatrix}
$$

![二次元平面で正方形が傾斜している図](/images/20231215/skew.png)

## CSSの`matrix関数`を用いた座標変換

さて、ここまできてようやくCSSの`matrix関数`の出番です。座標変換と変換行列について把握したところで、実際にどうやって`matrix関数`を使用するのかという部分について考えていきます。

### `matrix3d()`とは

まず3次元の座標（x,y,z）を対象とする`matrix3d()`について考えてみましょう。

https://developer.mozilla.org/ja/docs/Web/CSS/transform-function/matrix3d

> matrix3d() は CSS の関数で、 4x4 の 3D 同次変換行列を定義します。

`matrix3d()`に関してMDNの説明を読んでみると、上記のように書かれています。`matrix3d()`はこれまでに登場した同次座標系による変換行列を定義すると考えて良さそうです。

実際に`matrix3d()`は4×4=16個の値で指定を行います。

> matrix3d(a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4)

ただし、その値の順番には気を付ける必要があります。どういうことかというと`matrix3d()`は**列優先**になるということです。JavaScriptの配列などで行列を考える際は、通常**行優先**で考えることも多いと思いますので注意が必要です。

`matrix3d()`を4×4で記述すると

$$
matrix3d
\begin{pmatrix}
  a1, & b1, & c1, & d1, \\
  a2, & b2, & c2, & d2, \\
  a3, & b3, & c3, & d3, \\
  a4, & b4, & c4, & d4
\end{pmatrix}
$$

となり、これは次の変換行列

$$
\begin{bmatrix}
  a1 & a2 & a3 & a4 \\
  b1 & b2 & b3 & b4 \\
  c1 & c2 & c3 & c4 \\
  d1 & d2 & d3 & d4
\end{bmatrix}
$$

に対応します。

### `matrix()`とは

次に2次元の座標（x,y）を対象とする`matrix()`についても考えてみます。

https://developer.mozilla.org/ja/docs/Web/CSS/transform-function/matrix

> matrix() は CSS の関数で、二次元同次変換行列を定義します。

`matrix3d()`と同様に同次座標系の変換行列を定義すると考えて良さそうです。設定できる値は以下になります。

> matrix(a, b, c, d, tx, ty)

注目すべきなのは2次元の同次座標系で考えているのにもかかわらず、設定できる値が6個（3×3=9個ではなく）になるということでしょう。

実は`matrix()`の場合、対応する変換行列は以下のようになります。

$$
\begin{bmatrix}
  a & c & tx \\
  b & d & ty \\
  0 & 0 & 1
\end{bmatrix}
$$

3行目の値は常に固定なので`matrix()`では省略されるというわけです。

> matrix(a, b, c, d, tx, ty) は matrix3d(a, b, 0, 0, c, d, 0, 0, 0, 0, 1, 0, tx, ty, 0, 1) の短縮形です。

さらに`matrix()`は`matrix3d()`の短縮系であり、`matrix3d()`に変換することが可能です。3次元として考えれば以下のような変換行列となります。

$$
\begin{bmatrix}
  a & c & 0 & tx \\
  b & d & 0 & ty \\
  0 & 0 & 1 & 0 \\
  0 & 0 & 0 & 1
\end{bmatrix}
$$

これを任意の座標（x,y,z）を用いて、実際に計算してみます。

$$
\begin{bmatrix}
  a & c & 0 & tx \\
  b & d & 0 & ty \\
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
  x \times a + y \times c + tx \\
  x \times b + y \times d + ty \\
  z \\
  1
\end{bmatrix}
$$

上記よりZ座標に何の座標変換も行われないのが確認できました。3次元の座標においても、Z座標の座標変換を行わないのであれば、2次元の座標に対してのみ物事を考えることができますね。

### 平行移動と`matrix関数`

CSSの`matrix関数`による平行移動を実装してみましょう。他の座標変換のことも考えると手で計算するのは少し面倒なので、計算にはJavaScriptを使用します。

以下は平行移動の座標変換を行う実装例です。水色の「Origin」と書かれたボックスと、紫色の「Matrix」と書かれたボックスが存在します。水色のボックスは座標変換適用前、紫色のボックスは座標変換適用後の要素です（ここで指している座標変換の対象は`.box`の要素になります）。

@[codepen](https://codepen.io/yend24/pen/abXRbaJ)

平行移動の座標変換を行なっているのは次の箇所になります。

```js:JavaScript
// 平行移動の座標変換
const translate = (tx, ty, tz) => {
  // 平行移動の変換行列
  return [
    1, 0, 0, tx,
    0, 1, 0, ty,
    0, 0, 1, tz,
    0, 0, 0, 1,
  ]
};
const target = document.getElementById("matrix");
target.style.transform = convertArrayToCSSMatrix3d(translate(30, 100, 50));
```

上記の`translate(30, 100, 50)`はCSSの`translate3d(30px, 100px,50px)`に相当します。

::::details convertArrayToCSSMatrix3d関数
`convertArrayToCSSMatrix3d`はJavaScriptの配列をCSSの`matrix3d`に変換する関数です。

```js:JavaScript
// JavaScriptの配列をCSSのmatrix3d()に変換する
const convertArrayToCSSMatrix3d = (matrix) => {
  if (matrix.length !== 16) {
    throw new Error("Matrix must be 16 elements");
  }
  // 行優先から列優先への変換
  const rearrangedMatrix = [
    matrix[0], matrix[4], matrix[8], matrix[12],
    matrix[1], matrix[5], matrix[9], matrix[13],
    matrix[2], matrix[6], matrix[10], matrix[14],
    matrix[3], matrix[7], matrix[11], matrix[15],
  ]
  return `matrix3d(${rearrangedMatrix.join(",")})`;
};
```
::::

### 拡大縮小と`matrix関数`

次にCSSの`matrix関数`による拡大縮小の座標変換を実装してみましょう。

以下は拡大縮小の座標変換を行う実装例です。

@[codepen](https://codepen.io/yend24/pen/xxMMpzR)

拡大縮小の座標変換を行っているのは次の箇所になります。

```js:JavaScript
// 拡大縮小の座標変換
const scale = (sx, sy, sz) => {
  // 拡大縮小の変換行列
  return [
    sx, 0, 0, 0,
    0, sy, 0, 0,
    0, 0, sz, 0,
    0, 0, 0, 1,
  ]
};

const target = document.getElementById("matrix");
target.style.transform = convertArrayToCSSMatrix3d(scale(1.2, 1.2, 1.2));
```

上記の`scale(1.2, 1.2, 1.2)`はCSSの`scale3d(1.2, 1.2, 1.2)`に相当します。

### 回転と`matrix関数`

次に`matrix関数`を用いた回転の座標変換について考えてみます。[回転](#%E5%9B%9E%E8%BB%A2)はX軸、Y軸、Z軸をそれそれ分けて考えていたので、ここでも別々に実装を行います。

以下は上からX軸回転、Y軸回転、Z軸回転の座標変換を行う実装例です。

@[codepen](https://codepen.io/yend24/pen/oNmmpeZ)

回転の座標変換を行なっているのは次の箇所になります。

```js:JavaScript
const sin = Math.sin;
const cos = Math.cos;

// 度(度数法)から、ラジアン(弧度法)に変換
const degreesToRadians = (degrees) => {
  const radian = (Math.PI / 180) * degrees;
  return radian;
};

// X軸回転の座標変換
const rotateX = (theta) => {
  const radian = degreesToRadians(theta);
  // X軸回転の変換行列
  return [
    1, 0, 0, 0,
    0, cos(radian), -1 * sin(radian), 0,
    0, sin(radian), cos(radian), 0,
    0, 0, 0, 1,
  ]
};
// Y軸回転の座標変換
const rotateY = (theta) => {
  const radian = degreesToRadians(theta);
  // Y軸回転の変換行列
  return [
    cos(radian), 0, sin(radian), 0,
    0, 1, 0, 0,
    -1 * sin(radian), 0, cos(radian), 0,
    0, 0, 0, 1,
  ]
};
// Z軸回転の座標変換
const rotateZ = (theta) => {
  const radian = degreesToRadians(theta);
  // Z軸回転の変換行列
  return [
    cos(radian), -1 * sin(radian), 0, 0,
    sin(radian), cos(radian), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]
};

const targetX = document.getElementById("matrixX");
targetX.style.transform = convertArrayToCSSMatrix3d(rotateX(45));

const targetY = document.getElementById("matrixY");
targetY.style.transform = convertArrayToCSSMatrix3d(rotateY(45));

const targetZ = document.getElementById("matrixZ");
targetZ.style.transform = convertArrayToCSSMatrix3d(rotateZ(45));
```

上記の`rotateX(45)`、`rotateY(45)`、`rotateZ(45)`はそれぞれCSSの`rotateX(45deg)`、`rotateY(45deg)`、`rotateZ(45deg)`に相当します。

### 傾斜と`matrix関数`

最後に`matrix関数`を用いた傾斜の座標変換について考えてみます。[傾斜](#%E5%82%BE%E6%96%9C)は2次元の座標を対象としていたので、ここでは2次元の座標で考えます。

以下は傾斜の座標変換を行う実装例です。

@[codepen](https://codepen.io/yend24/pen/poGGpgG)

傾斜の座標変換を行なっているのは次の箇所になります。

```js:JavaScript
// 傾斜の座標変換
const skew = (thetaX, thetaY) => {
  const tan = Math.tan;
  const radianX = degreesToRadians(thetaX);
  const radianY = degreesToRadians(thetaY);
  // 傾斜の変換行列
  return [
    1, tan(radianX), 0,
    tan(radianY), 1, 0,
    0, 0, 1
  ]
};

const target = document.getElementById("matrix");
target.style.transform = convertArrayToCSSMatrix3d(skew(10, 20));
```

上記の`skew(10, 20)`はCSSの`skew(10deg, 20deg)`に相当します。

## おわりに

CSSの`transform`プロパティにおける`matrix関数`について書きました。本記事で紹介したように`matrix関数`はあまり直感的ではないので、ユースケースとしてはそれほど多くはないかもしれません。
ただ行列による座標変換についてはCSSに限った話ではなく、たとえばCanvasやWebGLにおいても用いいられることがあるので、どこかで役に立つことがあれば幸いです。

## 参考

https://drafts.csswg.org/css-transforms-2/
https://developer.mozilla.org/ja/docs/Web/CSS/transform-function
https://amzn.asia/d/2jB3088
