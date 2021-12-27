---
title: "CSSだけでおみくじを実装する"
emoji: "😺"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["CSS", "Sass", "Pug"]
published: true
---

実務では**役に立たない**CSSシリーズです。
本当は年始に上げたかった記事なのですが、おそらく寝正月を迎えると思うので、先に書きました。
年始にはまだちょっと早いネタ記事になりますが、季節の先取りということで。
CSSだけでおみくじを作りたい方の参考になれば幸いです。

# 完成形

まずは完成形です。
大凶~大吉までのおみくじを引けることがわかると思います。
ついでに引き直しの機能もつけたので、ぜひ大吉が出るまで引き続けてください（そういうものじゃない）。

@[codepen](https://codepen.io/yend24/pen/MWEOxOo)

以下、コードの解説は重要なところだけを抜粋して行っていきます。
全体のコードを確認したい時はCodePenを参照してください。

# 実装

まずは見た目のコーディングからやっていきましょう。

## 3Dの表現

奥行きのある箱を作りたいので、`transform-style`プロパティを使います。

https://developer.mozilla.org/ja/docs/Web/CSS/transform-style

詳しい説明はMDNに任せるとして。
CSSで立体的な表現をあまりしない方にとっては、馴染みのないプロパティかもしれません。
親要素に`transform-style:preserve-3d`を指定すると子要素を3D空間として配置できます。

## 立方体をつくる

少し遠回りになるのですが、CSSで立方体を作ってみます。

@[codepen](https://codepen.io/yend24/pen/BawJoWB)

```pug:pug
.box
  - for(let i = 0; i < 6; i++)
    .box__surface
```

```scss:scss
.box {
  position: relative;
  width: 200px;
  height: 200px;
  transform-style: preserve-3d;
  background-color: rgba(100, 0, 0, 0.3);
  &__surface {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    border: 5px solid lighten(rgba(0, 0, 100, 0.3), 50%);
    background-color: rgba(0, 0, 100, 0.3);
    &:nth-child(1) {
      top: -100%;
      transform-origin: center bottom;
      transform: translateZ(100px) rotateX(90deg);
    }
    &:nth-child(2) {
      left: -100%;
      transform-origin: right center;
      transform: translateZ(100px) rotateY(-90deg);
    }
    &:nth-child(3) {
      transform: translateZ(100px);
    }
    &:nth-child(4) {
      transform: translateZ(-100px);
    }
    &:nth-child(5) {
      left: 100%;
      transform-origin: left center;
      transform: translateZ(100px) rotateY(90deg);
    }
    &:nth-child(6) {
      top: 100%;
      transform-origin: center top;
      transform: translateZ(100px) rotateX(-90deg);
    }
  }
}
```

親要素である`.box`（赤色のやつ）に`transform-style:preserve-3d`を指定しています。
`.box`の正方形（赤色のやつ）を中心に子要素`.box__surface`の位置を各々ずらすことで、立方体を作ることができました。
上記コードによって、CSSだけでも3Dの表現ができることを確認できましたね。

## おみくじの箱をつくる

ここまででCSSを使って立方体を作る方法がわかったと思います。
おみくじの箱をつくる作業もほぼ一緒ですね。
立方体を六面すべて作ったところで、実際に一方向から見えるのは三面までなので、今回は三面だけ用意したいと思います。

@[codepen](https://codepen.io/yend24/pen/bGoaVLV)

## おみくじ機能

では、本命であるおみくじ機能の実装に移っていきます。

### 処理の分岐

今回は大凶から大吉まで、複数の状態を分岐する必要があるので`radio`ボタンを使いましょう。
`radio`ボタンを`body`直下、`.wrapper`の兄要素に配置します。
おみくじの種類の数だけ`radio`ボタンを用意し、どのボタンが`:checked`になっているかによって処理を分岐させます。


```pug:pug
//- ラジオボタンを .wrapper 兄要素に配置する
- for(let i = 0; i < 7; i++)
  input(type="radio" id="num-" + i name="omikuji")
.wrapper
  .box
    .box__surface.__top
      span.hole
      span.omikuji
    .box__surface.__side
    .box__surface.__side
      span おみくじ
  .btn
    .labels
      //- ラベル要素で radio ボタンに :checked をつける
      - for(let i = 0; i < 7; i++)
        label.label(for="num-"+i) 引く
```
```scss:scss
//　:checked がついた時、おみくじを表示
input:checked ~ .wrapper .omikuji {
  transform: rotateX(-90deg) translateY(-50%);
  transition: all 0.2s ease-out;
}
//　おみくじの種類の数だけ繰り返す
input[id="num-1"]:checked ~ .wrapper .omikuji {
  &::before {
    content: "大凶";
  }
}
input[id="num-2"]:checked ~ .wrapper .omikuji {
  &::before {
    content: "凶";
  }
}
// 以下ループ...
```

### ランダムの実装

本記事の内容でもっとも厄介な部分がランダムだと思います。
先に断っておくと、完全なランダムを実装できるわけではなく、あくまで**ランダムっぽい**ことをしているだけになります。
ではCSSでランダムっぽいことをどう実装しているのかというと、`label`を横に並べ、高速にスライドさせることによって実現しています。

:::message
下記CodePenではあえてゆっくりスライドさせていますが、実際はもっとはやくスライドさせて問題ありません。ただし、あまりにもはやすぎると反応しないことがあるので、その辺りは実際に実装しながら調整してください。
:::

@[codepen](https://codepen.io/yend24/pen/XWeVmLY)

上記コードでは、わかりやすくするためにボタンからはみ出した部分も可視化していますが、実際は`overflow:hidden`で隠します（`↓表示領域`の部分だけが表示される）。
こうすることによって、同じボタンをクリックしたように見せながら、違うボタンをクリックさせることが可能になります。

## 引き直し機能

最後に引き直し機能を実装します。`radio`ボタンをもう1つ加え（今回は`#num-7`）、そこに`:checked`がついた時はリセットするという実装にします。
リセットするというと上書きするようなイメージですが、`input`に`:checked`がない状態と同じ状態にするということです。

@[codepen](https://codepen.io/yend24/pen/BawJjNL)

実装しやすいのは`:not`を使うことだと思います。つまり`#num-7`以外に`:checked`がついた時だけおみくじを引いた状態にします。

```scss:scss
// #num-7　以外に :checked がついた時はおみくじを引く
// → #num-7　に :checked がついた時はリセットされる
input:not(#num-7):checked ~ .wrapper .btn {
  .label {
    // animationを止め　#num-7を表示する
    animation: none;
    transform: translateX(-700px);
  }
}
input:checked:not(#num-7) ~ .wrapper .omikuji {
 // おみくじを引く処理
}
```

以上の機能を盛り込めば完成となります！

# 完成コード

冒頭のCodePenと同様の内容になりますが、あらためて全体のコードを載せておきます。

::: details 完成コード
```pug:pug
- for(let i = 0; i < 8; i++)
  input(type="radio" id="num-" + i name="omikuji")
.wrapper
  .box
    .box__surface.__top
      span.hole
      span.omikuji
    .box__surface.__side
    .box__surface.__side
      span おみくじ
  .btn
    .labels
      - for(let i = 0; i < 7; i++)
        label.label(for="num-"+i) 引く
      label.label(for="num-7") 引き直す
```
```scss:scss
* {
  box-sizing: border-box;
}
input[name="omikuji"] {
  position: absolute;
  visibility: hidden;
}
.wrapper {
  height: 600px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: whitesmoke;
}
.box {
  position: relative;
  width: 200px;
  height: 300px;
  transform: rotateX(-30deg) rotateY(30deg);
  transform-style: preserve-3d;
  &__surface {
    position: absolute;
    border: 5px solid darken(darkorange, 20%);
    background-color: darkorange;
    width: 100%;
    &.__top {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      transform-style: preserve-3d;
      transform-origin: center bottom;
      transform: translateZ(100px) translateY(-100%) rotateX(90deg);
    }
    &.__side {
      width: 100%;
      height: 100%;
      &:nth-child(2) {
        left: -100%;
        transform-origin: center right;
        transform: translateZ(100px) rotateY(-90deg);
      }
      &:nth-child(3) {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 50px;
        font-weight: 600;
        writing-mode: vertical-rl;
        transform: translateZ(100px);
      }
    }
  }
}
.hole {
  display: inline-block;
  width: 60px;
  height: 60px;
  background-color: #000;
  border-radius: 50%;
}
.omikuji {
  position: absolute;
  top: 0;
  bottom: 0;
  display: inline-block;
  width: 30px;
  margin: auto 0;
  height: 50%;
  padding-top: 8px;
  background: #fff;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  transform: rotateX(-90deg) translateY(51%);
  box-shadow: 0px 0px 3px 0px rgb(0 0 0 / 20%);
}
.btn {
  position: relative;
  margin-top: 100px;
  width: 100px;
  height: 50px;
  overflow-x: hidden;
}
.labels {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  width: 800%;
  height: 100%;
  animation: anime 0.7s steps(7) infinite;
  z-index: 5;
  &:active {
    animation-play-state: paused;
  }
  &:hover {
    .label {
      background-color: lighten(dodgerblue, 5%);
    }
  }
}
.label {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 98px;
  height: calc(100% - 3px);
  margin: 0 1px;
  border-radius: 5px;
  background-color: dodgerblue;
  box-shadow: 0 3px 0 darken(dodgerblue, 40%);
  color: lighten(dodgerblue, 40%);
  font-weight: 600;
  cursor: pointer;
}
input:checked:not(#num-7) ~ .wrapper .btn {
  .labels {
    animation: none;
    transform: translate(-700px, 0);
  }
}
input:checked:not(#num-7) ~ .wrapper .omikuji {
  transform: rotateX(-90deg) translateY(-50%);
  transition: all 0.2s ease-out;
}
$omikuji: "大凶", "凶", "吉", "末吉", "小吉", "中吉", "大吉";
@each $o in $omikuji {
  $i: index($omikuji, $o);
  input[id="num-#{$i - 1}"]:checked ~ .wrapper .omikuji {
    &::before {
      content: "#{$o}";
    }
  }
}

@keyframes anime {
  to {
    transform: translate(-700px, 0);
  }
}
```
:::

# まとめ

CSSだけでおみくじ機能を実装する方法でした！
ランダムをCSSだけで実装する方法は色々な方のブログや記事、CodePenを参考にしました。先人の知恵に感謝。
本記事は実務では**役に立たない**可能性の高い内容となってますが、皆さんもぜひCSSで遊んでみてください。

# 参考

https://uxdesign.cc/creating-randomness-with-pure-css-a990dafcd569
https://css-tricks.com/are-there-random-numbers-in-css/
