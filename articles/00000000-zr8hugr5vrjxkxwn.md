---
title: '【CSS】transform の matrix を理解したい'
emoji: '⛳'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['css']
published: false
---

CSS の transform の [`matrix()`](https://developer.mozilla.org/ja/docs/Web/CSS/transform-function/matrix) および [`matrix3d()`](https://developer.mozilla.org/ja/docs/Web/CSS/transform-function/matrix3d) がよく分からないので理解しようという記事です。


## transform プロパティとは

https://developer.mozilla.org/ja/docs/Web/CSS/transform

> transform は CSS のプロパティで、与えられた要素を回転、拡大縮小、傾斜、移動することできます。

MDNに書かれているように `transform` プロパティを使用することで要素に回転、拡大縮小、傾斜、移動の変換を適用することができます。

## 回転、拡大縮小、傾斜、移動

本記事の目的である `matrix関数` を使用することで上記の変換を適用できますが、まずはそれよりメジャーで親しみやすい、いくつかの座標変換関数を簡単に復習しましょう。

### 平行移動（translate関数）

`translate関数` を用いることで三次元空間で要素を並行移動させることができます。

### 拡大縮小（scale関数）

`scale関数` を用いることで三次元空間で要素を拡大もしくは縮小させることができます。

### 回転（rotate関数）

`rotate関数` を用いることで三次元空間で要素を回転させることができます。

### 傾斜（skew関数）

`skew関数` を用いることで二次元空間で要素を歪めることができます。

## 変換行列

本記事でこれまでに登場した座標変換関数は `matrix関数` に置き換えることができます。

### 二次元の変換

### 三次元の変換

## おわりに