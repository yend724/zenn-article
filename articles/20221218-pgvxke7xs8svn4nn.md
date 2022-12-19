---
title: "【CSS】詳細度の基本と諸々"
emoji: "🔥"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["css"]
published: true
---

:::message
本記事は[「CSS Advent Calendar 2022」](https://qiita.com/advent-calendar/2022/cascading_style_sheets)の18日目の記事になります。
:::

昨今のマークアップでは、CSS設計の発展やフロントエンドフレームワークの台頭によって、以前よりも詳細度を意識することが少なくなっているかもしれません。`BEM`や`FLOCSS`を使った従来のCSS設計によるアプローチをはじめ、`CSS in JS`や`CSS Modules`を使った技術的なアプローチ、もしくは`Tailwind CSS`のようにユーティリティファーストで設計するアプローチもあります。

では、詳細度の悩みから完全に解放されたのかというと、そうではありません。過去の負債、技術的な成熟度、サードパーティ製のCSSとの競合、CSS設計に対する解像度や方針の違いなど、その理由は様々だと思います。先に述べたように、詳細度をよしなにやってくれる技術が増えてはいますが、依然として知識は必要です。でなければ、どのような方法やツールを用いたとしても、どこかでCSSの破綻が生じる可能性が高まります。

本記事ではそんな詳細度についての基本と、+αの諸々な話について書いていこうと思います。

# 詳細度の基本

まずは詳細度の基本について振り返りましょう。

> 詳細度 (Specificity) は、ある要素に最も関連性の高い CSS 宣言を決定するためにブラウザーが使用するアルゴリズムで、これによって、その要素に使用するプロパティ値が決定されます。詳細度のアルゴリズムは、CSS セレクターの重みを計算し、競合する CSS 宣言の中からどのルールを要素に適用するかを決定します。
>
> [詳細度 - CSS: カスケーディングスタイルシート | MDN](https://developer.mozilla.org/ja/docs/Web/CSS/Specificity)

詳細度とは、ある要素に対し複数のCSS宣言があり、そのプロパティと値が競合した際に、適用するプロパティ値を決定するためのアルゴリズムの1つです。最終的なプロパティ値の適用において、考慮すべきものは、詳細度だけに限りませんが、まずは詳細度だけにフォーカスして考えていき、その後+αの諸々について触れていきます。

## 詳細度の計算方法

詳細度という観点からみると、セレクターは以下の3つに分類することができます。

- A: [IDセレクター](https://developer.mozilla.org/ja/docs/Web/CSS/ID_selectors)
- B: [クラスセレクター](https://developer.mozilla.org/ja/docs/Web/CSS/Class_selectors)、[属性セレクター](https://developer.mozilla.org/ja/docs/Web/CSS/Attribute_selectors)、[擬似クラス](https://developer.mozilla.org/ja/docs/Web/CSS/Pseudo-classes)
- C: [要素型セレクター](https://developer.mozilla.org/ja/docs/Web/CSS/Type_selectors)、[擬似要素](https://developer.mozilla.org/ja/docs/Web/CSS/Pseudo-elements)

上記に分類されていない[全称セレクター](https://developer.mozilla.org/ja/docs/Web/CSS/Universal_selectors)は、特殊なセレクターであり、詳細度の計算には関与しません。

セレクターをA、B、Cという3つに分類しました。詳細度は、この3種類の**セレクターの数**によって決定され、本記事では、*(Aの値, Bの値, Cの値)* のように記述したいと思います。たとえば`#hoge`のようにIDセレクターが1つであれば、 *(1, 0, 0)* であり `#hoge.fuga` のようにIDセレクターとクラスセレクターが含まれていれば *(1, 1, 0)* 、`div span`のように要素型セレクターが2つなら *(0, 0, 2)* となります。

簡単な例を以下に示します。

```css:詳細度の例
* {} /* (0, 0, 0) */
div {} /* (0, 0, 1) */
div span {} /* (0, 0, 2) */
.hoge {} /* (0, 1, 0) */
#hoge {} /* (1, 0, 0) */
#hoge.fuga {} /* (1, 1, 0) */
#hoge .fuga div {} /* (1, 1, 1) */
```

## 詳細度の比較

ある要素に対し、複数のCSS宣言があるとき、基本的には詳細度が高ければ高いほど、そのプロパティ値は優先されやすくなります。では詳細度の高い、低いはどのように決まるのでしょうか。次はその比較方法について説明します。

例として、次のような記述があるとします。

```html
<p id="hoge" class="fuga">piyo</p>
```

```css
p#hoge.fuga { color: red; } /* (1, 1, 1) */
#hoge.fuga { color: green; } /* (1, 1, 0) */
#hoge { color: blue; } /* (1, 0, 0) */
.fuga { color: yellow; } /* (0, 1, 0) */
p { color: purple; } /* (0, 0, 1) */
```

複数のCSS宣言が競合しています。最終的にどの宣言が適用されるのか、わかりますでしょうか。

詳細度の比較は、以下の手順に沿って行われます。

1. 最初にAの値を比較し、最も大きいセレクターのスタイルが優先される
2. Aの値が同等のとき、次にBの値を比較し、最も大きいセレクターのスタイルが優先される
3. AとBの値が同等のとき、次にCの値を比較し、最も大きいセレクターのスタイルが優先される
4. A、B、Cの値がすべて同等であれば、最後に書かれたセレクターのスタイルが優先される

上記の手順に沿って、例の記述の比較を行ってみましょう。

```
1. 最初にAの値を比較し、最も大きいセレクターのスタイルが優先される

Aの数が大きいものは以下になる。
- p#hoge.fuga { color: red; } /* (1, 1, 1) */
- #hoge.fuga { color: green; } /* (1, 1, 0) */
- #hoge { color: blue; } /* (1, 0, 0) */

2. Aの値が同等のとき、次にBの値を比較し、最も大きいセレクターのスタイルが優先される

次にBの数が大きいものは以下になる。
- p#hoge.fuga { color: red; } /* (1, 1, 1) */
- #hoge.fuga { color: green: } /* (1, 1, 0) */

3. AとBの値が同等のとき、次にCの値を比較し、最も大きいセレクターのスタイルが優先される

次にCの数が大きいものは以下になる。
- p#hoge.fuga { color: red; } /* (1, 1, 1) */

この時点で残ったセレクターが1つなので、`color: red`が適用される（もし手順3の時点でセレクターが絞りきれなければ、最後に書かれたセレクターが優先される）。
```

いかかでしょうか。最終的に適用されるのは`p#hoge.fuga { color: red; }`の記述でした。手順に当てはめて比較していくだけなので、そこまで難しい作業ではないかもしれません。非常に複雑な指定でもない限り、慣れてくると案外すぐわかるようになります。

これまでの説明でわかるようにA、B、Cの値には超えられない壁があります。仮にIDセレクター1つに対し、クラスセレクター100個あったとしても、前者が優先されます。*(1, 0, 0)* と *(0, 100, 0)* の比較では、前者が勝つということです。

# 詳細度をコントロールする

CSSの記述において、詳細度をコントロールすることは非常に重要です。ここでは詳細度をコントローするための技術や知識を紹介しようと思います。

## IDセレクターの詳細度を低くする

IDセレクターは高い詳細度をもたらします。CSSの拡張性という観点からすると、詳細度はなるべく低く保つのがベターでしょう。そのような場合は、IDセレクターではなく属性セレクターを使うことができます。

属性セレクターは、Bに分類されるセレクターであり、クラスセレクターと同様の詳細度を持ちます。

```css:css
#hoge {} /* (1, 0, 0) */

/* 属性セレクターにすると詳細度を低く保てる */
[id="hoge"] {} /* (0, 1, 0) */
```

## 複合セレクターの重複は詳細度を高める

セレクターの具体性を高めずに、詳細度を高めたい際には、複合セレクターの重複を使用できます。

```css:css
.hoge {} /* (0, 1, 0) */
#hoge {} /* (1, 0, 0) */
:root p {} /* (0, 1, 1) */

/* 複合セレクターの重複は詳細度を高める */
.hoge.hoge {} /* (0, 2, 0) */
#hoge#hoge {} /* (2, 0, 0) */
:root:root p {} /* (0, 2, 1) */
```

テクニックとしては有用ですが、混乱の元となる可能性もありますので、使い所には注意してください。

## 擬似クラスは詳細度を高める

擬似クラスを使うことも詳細度を高めることに繋がります。`:nth-child(n)`を使うことで、複合セレクターの重複と同様に、具体性を高めることなく、詳細度を高めることができますが、こちらも使い所には注意が必要です。

```css:css
.hoge {} /* (0, 1, 0) */

/* 擬似クラスはで詳細度を高める */
.hoge:nth-child(2n + 1) {} /* (0, 2, 0) */

/* `:nth-child(n)`は具体性を高めずに詳細度を高める */
.hoge:nth-child(n) {} /* (0, 2, 0) */
.hoge:nth-child(n):nth-child(n) {} /* (0, 3, 0) */
```

また擬似クラスはBに含まれるので、あくまでBの値が1つ増えるだけということにも気をつけましょう。たとえば次の記述は意図しない結果を招くことがあります。

```html:html
<div id="hoge">
  <a>fuga</a>
</div>
```

```css:css
/* `:hover`が適用されない例 */
#hoge a { color: red; } /* (1, 0, 1) */
a:hover { color: blue; } /* (0, 1, 1) */
```

上記のコードでは、`a要素`が`:hover`状態だとしても、常に`color: red`が適用されます。

## 擬似クラスの例外

擬似クラスは、Bに分類され、詳細度を高めると説明しましたが、いくつかの例外が存在します。`:not()`、`:has()`、`:is()`、`:where()`などは、その例外にあたります。

### すべてを0にする`:where()`

わかりやすいのは`:where()`です。`:where()`はその引数のセレクターの詳細度を0にします。`:where()`を使うことで、セレクターの具体性を高めながら、詳細度を低く保つことができます。

```css:css
body p {} /* (0, 0, 2) */

/* :where()の引数は詳細度に影響を与えない */
:where(body) p {} /* (0, 0, 1) */
:where(.body) p {} /* (0, 0, 1) */
:where(#body) p {} /* (0, 0, 1) */
```

### 引数の中から最も高い詳細度を加える`:not()`、`:has()`、`:is()`

`:not()`、`:has()`、`:is()`は、自身が詳細度に影響を与ることはありませんが、その引数のセレクターが詳細度に影響を与えます。たとえば`:not(#hoge)`はAの値に1を加え、`:not(.hoge)`はBの値に1を加えます。

いくつかの単純な例を以下に示します。

```css:css
/* 引数のセレクターが詳細度に加わる */
.hoge:not(.fuga) {} /* (0, 2, 0) */
:is(body) .hoge {} /* (0, 1, 1) */
body:has(#hoge) .fuga {} /* (1, 1, 1) */
```

引数にカンマ区切りで複数のセレクターを指定した場合は、そのセレクターの中から最も高い詳細度が計算の対象となります。仮に`:not(body, .body, #body)`であれば、引数の中で最も高い詳細度を持つのはIDセレクターである`#body`なので、Aの値が1つ増加します。

これは次のようなケースで、意図しない結果を招く可能性があります。次のコードでは`color: red`が適用されてしまうことに気をつけましょう。

```html:html
<div class="fuga">
  <p>piyo</p>
</div>
```

```css:css
/* `:is()`の中で詳細度が最も高いのはIDセレクター */
:is(#hoge, .fuga) p { color: red; } /* (1, 0, 1) */

/* こちらのコードは詳細度で負ける */
.fuga p { color: blue; } /* (0, 1, 1) */
```

一方で、この性質と`:not()`をうまく使うことで、セレクターの具体性をほぼ高めることなく、詳細度を高めることもできます。以下のコードは`color: blue`が適用されます。

```html:html
<p class="hoge">piyo</p>
```

```css:css
/* 存在しないIDセレクターを`:not()`の引数にすることで具体性をほぼ高めることなく、詳細度を高めることができる */
p:not(#_) { color: blue; } /* (1, 0, 1) */

/* こちらのコードは詳細度で負ける */
p.hoge { color: red; } /* (0, 1, 1) */
```

こちらもテクニックとしては有用ですが、混乱の元となる可能性がありますので、使い所には注意してください。

# 詳細度の壁を乗り越える

詳細度には壁があると説明しました。詳細度の比較において、クラスセレクターがIDセレクターに勝つことはありませんし、要素型セレクターがクラスセレクターに勝つこともありません。故にCSSにおいて、詳細度の管理は非常に重要なものなのです。

しかしながら、これまでに行ってきた詳細度の比較とは別な方法で、CSS宣言を適用させる方法があります。ここでは通常では超えられない詳細度の壁を、乗り越える方法をご紹介します。

## インラインスタイル

要素に対するスタイルがインラインスタイルで記述された場合、通常のスタイルシートにあるCSS宣言を常に上書きします。これは、A、B、Cの分類で、Aよりもさらにもう1つ高いランクの詳細度をもつと考えても問題ありません。

次の例では常に`color: yellow`が優先されます。

```html:html
<!-- `color: yellow`が適用される -->
<p id="hoge" class="fuga" style="color: yellow">piyo</p>
```

```css:css
/* インラインスタイルが適用される */
#hoge { color: red; }
.hoge { color: green; }
p { color: blue; }
```

通常であればインラインスタイルを記述する機会は少ないかもしれませんが、`JavaScript`から要素を操作したり、バックエンド側から何かしらのスタイルを適用させたいときに有用となります。

## 要注意の`!important`

そんなインラインスタイルですら敵わないのが、`!important`です。プロパティの値に`!important`が付与されると、もはや詳細度に関係なく、最優先のCSS宣言となります。

```html
<p id="hoge" class="fuga">piyo</p>
```

```css:css
p#hoge.fuga { color: red; }
/* 詳細度に関係なく`!important`の`color: blue`が適用される */
p { color: blue !important; }
```

ただし、`!important`が付与された宣言同士では、これまでと同様に詳細度の比較が行われます。

```css:css
/* `!important`同士では、詳細度の比較が行われるので`color: red`が適用される */
p#hoge.fuga { color: red !important; } /* (1, 1, 1) */
p { color: blue !important; } /* (0, 0, 1) */
```

`!important`の使用は、必ずしも悪ではありませんが、細心の注意が必要です。`!important`を使う際は、それが本当に必要なものなのか、将来的に管理できるものなのかを、よく検討してから使うようにしましょう。

## 新たな救世主となりえる`@layer`

`!important`は、必ずしも悪ではないと書きましたが、可能な限りは避けたいものです。そんな時に新たな救世主となりえるのが`@layer`です。

`@layer`はモダンブラウザでサポートされてからまだ日が浅いため、現時点ではあまり見かけることはないかもしれません（この記事の執筆時点では、筆者自身も現場で目撃したことがありません）。

`@layer`は*カスケードレイヤー*として、詳細度とは別に、CSSの優先順位を制御する方法の1つです。カスケードレイヤーの制御は、詳細度よりも優先されて適用されます。つまり複数のセレクターが競合した際に、詳細度が低いセレクターでも、カスケードレイヤーによっては優先されて適用される可能性があるということです。

簡単な例を示します。以下のコードでは、詳細度に関係なく、`baseレイヤー`よりも`overwriteレイヤー`が優先されるので、`color: blue`が適用されます。

```html:html
<p id="hoge" class="fuga">piyo</p>
```

```css:css
/*
  最初にレイヤーの優先順位を定義できる
  後に書いたレイヤーが優先される
*/
@layer base, overwrite;

@layer base {
  #hoge.fuga {
    color: red;
  }
}
/* 詳細度に関係なくoverwriteレイヤーが優先される */
@layer overwrite {
  p {
    color: blue;
  }
}
```

今までユーティリティクラスに`!important`を使用したり、サードパーティ製CSSとの競合のために高い詳細度を指定していたケースでは、今後`@layer`が有用になる可能性があります。

```css:utilityの例
/* 詳細度関係なく、utilityレイヤーが優先される */
@layer base, utility;
@layer base {
  /* ...略... */
}
@layer utility {
  .u-text-small {
    font-size: font-size: 0.75rem;
  }
  .u-text-base: {
    font-size: font-size: 1rem;
  }
  .u-text-large: {
    font-size: font-size: 1.25rem;
  }
}
```

```css:サードパーティ製CSSの例
/* 詳細度関係なく、base > third-party > resetの順で優先される */
@import(reset.css) layer(reset);
@import(third-party.css) layer(third-party);
@layer reset third-party base;
@layer base {
  /* ...略... */
}
```

カスケードレイヤーの優先順位は、基本的にインラインスタイルと詳細度の間に位置するものになります。つまり「`!important` > インラインスタイル >
カスケードレイヤー > 詳細度」という順番で宣言が優先されます。ただし、`!important`とカスケードレイヤーが絡むことで、カスケードレイヤーの優先順位の逆転が生じることがあるので、より掘り下げて確認したい場合は、[MDNをご参照ください](https://developer.mozilla.org/ja/docs/Web/CSS/Cascade)。

# ScopedなCSSを実現するShadow DOM

詳細度とはあまり関係がありませんが、最後にShadow DOMについても、軽く触れておきます。Web Componentsを担う技術の1つとして、たびたび目にするShadow DOMですが、Shadow DOMを使用するとScopedなCSSを実現することができます。Shadow DOMはLight DOM（Shadow DOMに対して、通常のDOMをしばしばLight DOMと呼ぶ）から切り離された環境であり、実装には、`JavaScript`が必要です。

簡単な例を以下に示します。

```html:html
<div id="shadowRoot"></div>
<p>Light DOM</p>
```

```css:css
/* Shadow DOM には影響を与えない */
p { color: blue !important; }
```

```js:javascript
const elemnt = document.getElementById('shadowRoot');
const shadowRoot = elemnt.attachShadow({ mode: 'closed' });
shadowRoot.innerHTML = `
  <style>
    p {
      color: red;
      text-transform: uppercase;
    }
  </style>
  <p>Shadow DOM</p>
`;
```

@[codepen](https://codepen.io/yend24/pen/rNrBPvJ)

上記のCodePenをみてもわかるようにShadow DOMには`p { color: blue !important; }`が適用されていません。逆にShadow DOMの内部で宣言した`text-transform: uppercase;`がLight DOMに影響を与えることもありません。Shadow DOMを実装することで、ScopedなCSSを実現できているのがわかります。

Shadow DOMを単体で使うことはあまりないかもしれませんが、Web Componentsの実装の過程でみかける機会は今後増えていくかもしれませんね。

# おわりに

CSSの基本ではありますが、地味にややこしい詳細度（と+α）の話でした。つい疎かになりがちですが、新しいセレクターが増えるごとに、詳細度の知識もアップデートする必要があります。（私も含め）日々キャッチアップすることでクリーンなCSSを目指せたら良いですね。

# 参考

https://www.w3.org/TR/selectors-4/#specificity-rules
https://developer.mozilla.org/ja/docs/Web/CSS/Specificity
https://developer.mozilla.org/ja/docs/Web/CSS/@layer
https://developer.mozilla.org/ja/docs/Web/Web_Components/Using_shadow_DOM