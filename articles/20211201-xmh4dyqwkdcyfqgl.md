---
title: "【CSS】テキストカラーにウェーブアニメーションを適用する"
emoji: "🍣"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["CSS"]
published: false
---

# 概要

CSS だけでテキストカラーにウェーブアニメーションを適用します。

# 完成形

@[codepen](https://codepen.io/yend24/pen/QWqWVGy)

まずは完成コード。汎用性を高めるために一部 JavaScript も使っていますが、アニメーション部分は CSS のみです。
ここからは重要なコードについて抜粋しながら説明していくので、全体のコードを確認したい時は上記 **CodePen** を参考にしてください。

# CSS の実装

では順を追って説明していきます。

## 一文字だけでアニメーション

まずは一文字だけ。A という文字だけで考えてみます。

```html:html
<p class="animation">A</p>
```

```scss:scss
.animation {
	position: relative;
	font-size: 60px;
	font-weight: 600;
	color: blue;
	&::before {
		content: "A";
		position: absolute;
		top: 0;
		left: 0;
		height: 0;
		color: red;
		text-shadow: 1px 1px 0 #fff, 1px 0 0 #fff, 0 1px 0 #fff, -1px -1px 0 #fff,
			-1px 0 #fff, 0 -1px 0 #fff; // 背景色に合わせてで縁取り
		overflow: hidden;
		animation: move 0.5s ease infinite alternate;
	}
}
@keyframes move {
	0% {
		height: 0%;
	}
	100% {
		height: 100%;
	}
}
```

擬似要素で異なる色の同じ文字を重ね、その高さを変えることでアニメーションしています。
一点注意事項として、ただ擬似要素を重ねるだけでは下の色（上記の場合 `blue` ）がブラウザによっては、はみ出してしまうことがあります。
したがって、 `text-shadow` で背景色に合わせて縁取りすることによって、はみ出し問題を解消しています。

## 複数文字でアニメーション

次に複数文字のアニメーションを考えましょう。

```html:html
<p class="animation">
	<span class="text">A</span><span class="text">n</span
	><span class="text">i</span><span class="text">m</span
	><span class="text">a</span><span class="text">t</span
	><span class="text">i</span><span class="text">o</span
	><span class="text">n</span>
</p>
```

```scss:scss
.animation {
	font-size: 60px;
	font-weight: 600;
}
.text {
	position: relative;
	color: blue;
	&::before {
		position: absolute;
		top: 0;
		left: 0;
		height: 0;
		color: red;
		text-shadow: 1px 1px 0 #fff, 1px 0 0 #fff, 0 1px 0 #fff, -1px -1px 0 #fff,
			-1px 0 #fff, 0 -1px 0 #fff;
		overflow: hidden;
		animation: move 0.5s ease infinite alternate;
	}
	&:nth-child(1) {
		&::before {
			content: "A";
		}
	}
	&:nth-child(2) {
		&::before {
			content: "n";
		}
	}
	&:nth-child(3) {
		&::before {
			content: "i";
		}
	}
	&:nth-child(4) {
		&::before {
			content: "m";
		}
	}
	&:nth-child(5) {
		&::before {
			content: "a";
		}
	}
	&:nth-child(6) {
		&::before {
			content: "t";
		}
	}
	&:nth-child(7) {
		&::before {
			content: "i";
		}
	}
	&:nth-child(8) {
		&::before {
			content: "o";
		}
	}
	&:nth-child(9) {
		&::before {
			content: "n";
		}
	}
}
@keyframes move {
	0% {
		height: 0%;
	}
	100% {
		height: 100%;
	}
}
```

複数の文字でアニメーション数ため、`span` でネストを一つ深くしたくらいで、基本的には一文字の時と同じですね。
擬似要素の `content` にはそれぞれ対応する文字を代入しています。

## Sass のループと attr() 関数を使用する

あとはそれぞれのアニメーション開始時間をずらせば完成ではあるのですが、一つ一つ書いていくのは辛いので、`Sass` のループを使います。
また `attr()関数` を使うことで動的に擬似要素の `content` を設定することができるので、修正しましょう。

```html:html
<p class="animation">
	<!-- data-text属性の追加 -->
	<span class="text" data-text="A">A</span
	><span class="text" data-text="n">n</span
	><span class="text" data-text="i">i</span
	><span class="text" data-text="m">m</span
	><span class="text" data-text="a">a</span
	><span class="text" data-text="t">t</span
	><span class="text" data-text="i">i</span
	><span class="text" data-text="o">o</span
	><span class="text" data-text="n">n</span>
</p>
```

```scss:scss
.animation {
	font-size: 60px;
	font-weight: 600;
}
.text {
	position: relative;
	color: blue;
	&::before {
		position: absolute;
		top: 0;
		left: 0;
		height: 0;
		color: red;
		text-shadow: 1px 1px 0 #fff, 1px 0 0 #fff, 0 1px 0 #fff, -1px -1px 0 #fff,
			-1px 0 #fff, 0 -1px 0 #fff;
		overflow: hidden;
		animation: move 0.5s ease infinite alternate;
	}

	// 1 ~ 20 まで
	// 20 は対象の文字数より大きい数字であればなんでもOK
	@for $i from 1 through 20 {
		&:nth-child(#{$i}) {
			&::before {
				content: attr(data-text); //data-text　属性の文字を設定できる
				animation-delay: (($i - 1) / 10) + s; // 0.1s　ずつずらす
			}
		}
	}
}
@keyframes move {
	0% {
		height: 0%;
	}
	100% {
		height: 100%;
	}
}
```

かなりスッキリしましたね。アニメーション自体はこれで完成になります。

## JavaScript で汎用性を高める

ついでに JavaScript を用いてリファクタしましょう。
アニメーションする文字を一文字一文字 `span` で区切るのはめんどくさいので、その辺りを JavaScript に任せたいと思います。

```html
<p class="animation">Animation</p>
```

```js:javascript
const $animations = document.querySelectorAll(".animation");
$animations.forEach($animation => {
	const text = $animation.textContent.trim();
	const splitedText = text
		.split("")
		.map(c => `<span class="text" data-text="${c}">${c}</span>`)
		.join("");
	$animation.innerHTML = splitedText;
});
```

やっていることは単純で、`.animation` の中にあるテキストを `span` で分割しています。
JavaScript で制御することにより複数箇所に同様のアニメーションを適用させたり、文字に変更があったとしても簡単に修正できるようになりました。

以上でコードの完成になります！

# まとめ

使い所があるのかわかりませんが、ウェーブアニメーションの実装法でした。
`attr()` を使って面白そうなアニメーションを実装しようと思ったのが、今回の発端になります。
IE11 でも動作するので、`attr()` の面白い・便利な使い方があれば、是非教えてください。
