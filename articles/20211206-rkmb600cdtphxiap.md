---
title: "CSSだけで実装するマウス・インタラクションっぽいやつ"
emoji: "🐷"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["CSS", "Sass", "Pug"]
published: false
---

初めに断っておきます。
本記事で紹介する技術は実務では**役に立たない**、もしくは**役に立たない可能性が高い**です。
なので遊びの延長として捉えてもらえるとありがたく思います。

# 概要

CSS だけでマウス・インタラクションっぽいやつを実装する方法を紹介します。
インタラクションの実装というと難しそうな感じがしますが、今回の実装はあくまでマウス・インタラクション**っぽい**、いわばなんちゃってインタラクション（しかも CSS のみ）なので、軽い気持ちで読んでいきましょう。

# 完成形

なにはともあれ完成形の紹介です。犬の目線がマウスカーソルを追いかけているように見えますね。
今回はこちらの完成形をもとに説明していきます。

@[codepen](https://codepen.io/yend24/pen/gOGPmvz)

※CodePen に全体のコードを載せている時は、必要なコードだけを抜粋して説明していきます。全体のコードを確認したい時は CodePen を参照してください。

# マウスの位置を取得する

マウス・インタラクションを実装するためにはマウスの位置を取得したいですね。
しかしながら JavaScript と異なり CSS には直接マウスの位置を取得する方法がありません。
ではどうするかというと `:hover` を使います。

@[codepen](https://codepen.io/yend24/pen/WNZrpPB)

```scss:scss
$rows: 25;
$cols: 4;
.container {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
}
.point {
  display: inline-block;
  width: (100% / $cols);
  height: (100% / $rows);
  box-sizing: border-box;
  border: 1px solid rgba(100, 0, 0, 0.2);
  background-color: rgba(200, 0, 0, 0.2);
  &:hover {
    background-color: rgba(200, 0, 0, 0.6);
  }
}
```

ホバーした箇所の色が変化します。
画面サイズに DOM 要素を並べることで、マウスがホバーしている要素を取得することができます。

より多くの要素を使うことによって以下のようにマウスストーカーっぽいこともできます。

@[codepen](https://codepen.io/yend24/pen/abLdWvy)

# マウスの位置をもとに他の要素のスタイルを変更する

`:hover` の要素をもとに他の要素をスタイルを変更してみます。
これは非常に簡単で `~` を使うことによって実現できます。ちなみに `~` は`一般兄弟結合子` というらしいです。

下記のように使います。

```css:css
.older ~ .younger {
	color: red;
}
```

詳しい説明は MDN を読んでください。

https://developer.mozilla.org/ja/docs/Web/CSS/General_sibling_combinator

> まず、右側のセレクタで選択される要素が、左側のセレクタで選択される要素より後に現れることです。（直後である必要はありません）
> もうひとつは、これらの要素が同じ親要素（要素）をもつことです。

重要なのはこの 2 点ですね。

- 兄弟要素であること
- `兄要素` ~ `弟要素` の順であること

簡単に使用例を書いてみます。

@[codepen](https://codepen.io/yend24/pen/VwMebEg)

ホバーした要素とは別の要素のスタイルを変更できました。
`:hover` と `~`。この二つを組み合わせることで、インタラクティブっぽい実装が可能となります。

では、試しに犬の目だけを実装してみましょう。

@[codepen](https://codepen.io/yend24/pen/xxXZrre)

```scss:scss
$rows: 25;
$cols: 2;
.container {
	position: relative;
	display: flex;
	flex-wrap: wrap;
	width: 100%;
	height: 100%;
	> .point {
		display: inline-block;
		width: 100% / $cols;
		height: 100% / $rows;
		z-index: 100; // .point .faceより前面に来る必要がある
		// マウスが右側にあるか左側にあるかで、回転の向きを変える
		@for $i from 0 through ($rows - 1) {
			// ($i * 2) + 1 は奇数なので左側にマウスがある時
			&:nth-child(#{($i * 2) + 1}):hover ~ .face {
				.eye {
					&.l {
						transform: rotate(#{$i * -180 / ($rows - 1)}deg);
					}
					&.r {
						transform: rotate(#{$i * -180 / ($rows - 1)}deg);
					}
				}
			}
			// ($i * 2) + 1 は偶数なので右側にマウスがある時
			&:nth-child(#{($i * 2) + 2}):hover ~ .face {
				.eye {
					&.l {
						transform: rotate(#{$i * 180 / ($rows - 1)}deg);
					}
					&.r {
						transform: rotate(#{$i * 180 / ($rows - 1)}deg);
					}
				}
			}
		}
	}
}
```

上記のコードにおける注意点としてはホバーを認識する要素（`.point`）とスタイルを変更する要素が兄弟要素である（兄弟要素に含まれる）こと、またスタイルを変更する要素（`.face`）が `absolute` であることくらいですね。

目の回転に必要な `transform:rotate()` の計算は下記のような感じです。

```
$rows: 25 で
@for $i from 0 through ($rows - 1)　の時
$i は 0 ~ 24 までなので

0 <= $i * 180 / ($rows - 1) <= 180

であり、マウスが右側にあるか左側にあるかで符号を反転すれば犬の目がマウスを追っているように見える
```

あとは同様に耳の傾きを計算して、他パーツを配置すれば完成となります。

# 完成コード

冒頭の CodePen に載っているコードと同じものになりますが、こちらにも記載しておきます。

:::details 完成コード

```pug:pug
.wrapper
  .container
    - for (var i = 0; i < 50; i++)
      span.point
    .face
      .ears
        .ear.l
        .ear.r
      .eyes
        .eye.l
          span
        .eye.r
          span
      .nose
      .mouse
```

```scss:scss
$rows: 25;
$cols: 2;
html,body {
  width: 100%;
  height: 100%;
}
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: skyblue;
}
.container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  > .point {
    position: relative;
    display: inline-block;
    width: 100% / $cols;
    height: 100% / $rows;
    z-index: 100;
    // 目の回転
    @for $i from 0 through ($rows - 1){
      &:nth-child(#{($i * 2) + 1}):hover ~ .face {
        .eye {
          &.l {
            transform: rotate(#{$i * -180 / ($rows - 1)}deg)
          }
          &.r {
            transform: rotate(#{$i * -180 / ($rows - 1)}deg)
          }
        }
      }
      &:nth-child(#{($i * 2) + 2}):hover ~ .face {
        .eye {
          &.l {
            transform: rotate(#{$i * 180 / ($rows - 1)}deg)
          }
          &.r {
            transform: rotate(#{$i * 180 / ($rows - 1)}deg)
          }
        }
      }
    }
    // 耳の調整
    @for $i from 0 through ($rows - 1) {
      &:nth-child(#{$i * 2 + 1}):hover,
      &:nth-child(#{$i * 2 + 2}):hover {
        & ~ .face {
          .ear {
            &.l {
              transform: rotate(#{$i + 45}deg);
            }
            &.r {
              transform: rotate(#{($i * -1) - 45}deg);
            }
          }
        }
      }
    }
  }
}

.face {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 300px;
  height: 300px;
  margin: auto;
  border-radius: 30%;
  background-color: orange;
}

.eyes {
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;
  width: 250px;
  height: 100px;
  margin: 0 auto;
  .eye {
    position: absolute;
    top: 0;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background-color: white;
    &.l {
      left: 0;
    }
    &.r {
      right: 0;
    }
    > span {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 50%;
      height: 50%;
      margin: 0 auto;
      border-radius: 50%;
      background-color: #000;
    }
  }
}

.ears {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  .ear {
    position: absolute;
    top: 0;
    width: 100px;
    height: 200px;
    background: #000;
    border-radius: 50px / 100px;
    &.l {
      left: -10px;
      transform-origin: top center;
      transform: rotate(45deg);
    }
    &.r {
      right: -10px;
      transform-origin: top center;
      transform: rotate(-45deg);
    }
  }
}

.nose {
  position: absolute;
  width: 50px;
  height: 30px;
  background-color: #000;
  top: 200px;
  left: 0;
  right: 0;
  margin: 0 auto;
  border-radius: 50%;
  z-index: 10;
}

.mouse {
  position: absolute;
  top: 220px;
  right: 0;
  left: 0;
  width: 100px;
  height: 25px;
  margin: 0 auto;
  box-sizing: border-box;
  &::before, &::after {
    content: "";
    position: absolute;
    top: 0;
    width: 50%;
    height: 100%;
  }
  &::before {
    left: 0;
    border-bottom-left-radius: 50%;
    border-bottom-right-radius: 100%;
    border-bottom: 3px solid #000;
    border-right: 3px solid #000;
  }
  &::after {
    right: 0;
    border-bottom-left-radius: 100%;
    border-bottom-right-radius: 50%;
    border-bottom: 3px solid #000;
    border-left: 3px solid #000;
  }
}
```

:::

# まとめ

CSS だけを使用したマウス・インタラクション**っぽい**実装でした。
とりわけ難しいプロパティや手法を使っているわけではないので、ぜひ試してみてください。
本記事の内容は実務であまり使う機会のない遊びみたいなものですが、遊んでいるうちに思わぬ発見があったりします。
CSS の可能性は発想次第で無限大だと思うので、どんどん遊んでいきましょう。
