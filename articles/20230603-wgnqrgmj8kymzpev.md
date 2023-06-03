---
title: "Tailwind Variantsに触れてみる"
emoji: "🍣"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["tailwind-variants", "tailwindcss"]
published: true
---

https://www.tailwind-variants.org/

:::message
本記事執筆時点(2023.6.3)において、Tailwind Variantsのバージョンは**v0.1.5**となっています。
:::

## Tailwind Variantsとは

> Tailwind Variants a first-class variant API library for [TailwindCSS](https://tailwindcss.com/).
> 引用元: https://www.tailwind-variants.org/docs/introduction

ドキュメントに書かれているように、Tailwind VariantsはTailwindCSSの機能とファーストクラスのVariant APIを組み合わせた技術です。TypeScriptベースで作成されているので型安全であり、特定のフレームワークに依存しないユーティリティライブラリとなっています。

ここで登場したVariant APIという言葉ですが、これは[Stitches](https://stitches.dev)というCSS in JSライブラリの影響を受けたものであり、Tailwind Variantsはその考え方をTailwindCSSに輸入しています。

Variantsには「変異体」という意味があるようですが、Variant APIを用いることで、一つのコンポーネントに対し複数のバージョン（バリエーション）を容易に追加することができるようになります。

:::details StitchesのVariant APIの例

Stitchesでは次のように[`styled()`](https://stitches.dev/docs/api#styled)を使用して`variants`を追加できます。

```tsx
const Button = styled('button', {
  // base styles

  variants: {
    variant: {
      primary: {
        // primary styles
      },
      secondary: {
        // secondary styles
      },
    },
  },
});

// Use it
<Button>Button</Button>
<Button variant="primary">Primary button</Button>
```

もしくは[`css()`](https://stitches.dev/docs/api#css)を使って次のようにも記述できます。

```tsx
const button = css({
  // base styles

  variants: {
    variant: {
      primary: {
        // primary styles
      },
      secondary: {
        // secondary styles
      },
    },
  },
});

// Use it
<div className={button()}>Button</div>
<div className={button({ variant: 'primary' })}>Primary button</div>
```
:::

## Tailwind Variantsに触れてみよう

:::message
前述したようにTailwind Variantsは特定のフレームワークに依存しませんが、筆者の都合上、本記事ではReactを用いた説明となっています。
:::

### TailwindCSSのセットアップ

TailwindCSSを前提としたライブラリなので、事前に[TailwindCSSのセットアップ](https://tailwindcss.com/docs/installation)が必要です。

### インストール

TailwindCSSのセットアップが済んだらTailwind Variantsをインストールしましょう。

```shell
$ npm install tailwind-variants
```

### 基本のスタイル

Tailwind Variantsでは次のように[`tv()`](https://www.tailwind-variants.org/docs/api-reference)を使用してクラス名の生成を行います。

```tsx
import { tv } from 'tailwind-variants';

const button = tv({
  base: 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded',
});

// button()
// => "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
export const Button = () => {
  return <button className={button()}>Button</button>;
};
```

上記のように、第1引数に渡したオブジェクトの`base`キーが基本のスタイルとなります。

:::message
もしくは`base: ['bg-blue-500', 'hover:bg-blue-700',...]`のように、配列で指定しても問題ありません。
:::

`button()`の戻り値として`base`の文字列がそのまま返ってきているように見えますが、内部的には[tailwind-merge](https://github.com/dcastil/tailwind-merge)で処理されているので、TailwindCSSにおけるクラス名の非効率な重複を避けられるようになっています。

たとえばこれは以下のような挙動になるということです。

```tsx
const style = tv({
  base: 'bg-blue-500 bg-red-500',
});

style()
// => "bg-red-500"
```

ちなみに[twMerge](https://www.tailwind-variants.org/docs/api-reference#twmerge)を`false`にすることで、tailwind-mergeの挙動をオフにすることも可能です。

```tsx
const style = tv({
  base: 'bg-blue-500 bg-red-500',
}, {
  twMerge: false
});

style()
// => "bg-blue-500 bg-red-500"
```

### Variants

[Variants](https://www.tailwind-variants.org/docs/variants)はTailwind Variantsというライブラリの名前からしても、重要な機能だと考えられます。Variantsを用いることで同一のコンポーネントに対し、複数のバージョンのスタイルを容易に追加することができます。

Variantsを追加するためには、`variants`キーを使用します。以下の例では`color`に対して`primary`と`secondary`の色を設定しています。どの`variants`を使用するかは、`button({ color: 'primary' })`のように引数で指定します。

```tsx
const button = tv({
  base: 'text-white p-4',
  variants: {
    color: {
      primary: 'bg-blue-500',
      secondary: 'bg-red-500',
    },
  },
});

button({ color: 'primary' })
// => "text-white p-4 bg-blue-500"

button({ color: 'secondary' })
// => "text-white p-4 bg-red-500"
```

上記では色だけを設定していますが、複数の`variants`を設定することもできます。以下の例では`color`と`size`を設定してます。

```tsx
const button = tv({
  base: 'text-white p-4',
  variants: {
    color: {
      primary: 'bg-blue-500',
      secondary: 'bg-red-500',
    },
    size: {
      small: 'text-sm p-2',
      base: 'text-base p-4',
      large: 'text-lg p-6',
    },
  },
});

button({ color: 'primary', size: 'small' })
// => "text-white bg-blue-500 text-sm p-2"

button({ color: 'secondary', size: 'large' })
// => "text-white bg-blue-500 text-base p-6"
```

ここで`size`に注目してみると、`base`の`p-4`が上書きされていることがわかります。このように`variants`に書いたクラスは基本スタイルを上書きします。

#### Booleanなvariants

たとえばdisableフラグのように、booleanな値を使用して`variants`を設定することもできます。

```tsx
const button = tv({
  base: 'text-white p-4',
  variants: {
    color: {
      primary: 'bg-blue-500',
      secondary: 'bg-red-500',
    },
    // booelanなvariantsを設定
    disable: {
      true: 'pointer-events-none opacity-20',
    },
  },
});

button({ color: 'primary', disable: true });
// => "text-white p-4 bg-blue-500 pointer-events-none opacity-20"
```

#### デフォルト値の設定

`variants`に対し、デフォルト値を設定したい場合は`defaultVariants`キーを使用します。

```tsx
const button = tv({
  base: 'text-white',
  variants: {
    color: {
      primary: 'bg-blue-500',
      secondary: 'bg-red-500',
    },
    size: {
      small: 'text-sm p-2',
      base: 'text-base p-4',
      large: 'text-lg p-6',
    },
  },
  defaultVariants: {
    color: 'primary',
    size: 'base',
  },
});

button()
// => "text-white bg-blue-500 text-base p-4"
// defaultVariantsの値がデフォルトとなる
// base() は base({ color: 'primary', size: 'base' }) と同等になる
```

#### レスポンシブの記述

TailwindCSSでレスポンシブにおけるメディアクエリの記述を煩わしく思っている人もいるかもしれません。Tailwind Variantsでは、従来の方法に加え、次のように[TailwindCSSのブレイクポイント](https://tailwindcss.com/docs/responsive-design)を扱うことができます。

```tsx
const button = tv(
  {
    base: 'text-white',
    variants: {
      color: {
        primary: 'bg-blue-500',
        secondary: 'bg-red-500',
      },
      size: {
        small: 'text-sm p-2',
        base: 'text-base p-4',
        large: 'text-lg p-6',
      },
    },
  },
  {
    responsiveVariants: ['md', 'lg'],
  }
);

button({
  color: 'primary',
  size: {
    initial: 'small',
    md: 'base',
    lg: 'large',
  },
})
// => "text-white bg-blue-500 text-sm p-2 md:text-base md:p-4 lg:text-lg lg:p-6"
```

:::details Responsive variantsを扱うための前準備

Tailwind Variantsでレスポンシブな`variants`を扱いたい場合、前準備として`tailwind.config.js`を変更する必要があります。

```js:tailwind.config.js
const { withTV } = require('tailwind-variants/transformer')

/** @type {import('tailwindcss').Config} */
module.exports = withTV({
  content:  ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
})
```

詳しくは以下のドキュメントをご覧ください。
https://www.tailwind-variants.org/docs/getting-started#responsive-variants-optional
:::

本記事は触れませんが他にも、別の`variants`に依存した`variants`を追加できる[`compoundVariants`](https://www.tailwind-variants.org/docs/variants#compound-variants)などの機能もあります。

### Slot

[Slot](https://www.tailwind-variants.org/docs/slots)を使用すると、一度に分割された複数のコンポーネントに対するスタイルを作成できます。言葉だけではイメージしづらいと思うので、実際にコード例を見てみましょう。

```tsx
import { tv } from 'tailwind-variants';

const card = tv({
  slots: {
    figure: 'w-48 p-4 border-2 border-solid bg-gray-100 text-center',
    avatar: 'inline-block w-full',
    caption: 'mt-2 text-gray-900 font-bold',
  },
});

const { figure, avatar, caption } = card();

export const Card = () => {
  return (
    <figure className={figure()}>
      <img
        className={avatar()}
        src="avatar.png"
        alt="Avator"
      />
      <figcaption className={caption()}>Caption</figcaption>
    </figure>
  );
};

/*
Result:
<figure class="'w-48 p-4 border-2 border-solid bg-gray-100 text-center">
  <img src="avatar.png" alt="Avator" class="inline-block w-full">
  <figcaption class="mt-2 text-gray-900 font-bold">Caption</figcaption>
</figure>
*/
```

また次のように`slots`と`variants`を併用して使うこともできます。

```tsx
const card = tv({
  slots: {
    figure: 'w-48 p-4 border-2 border-solid bg-gray-100 text-center',
    avatar: 'inline-block w-full',
    caption: 'mt-2 text-gray-900 font-bold',
  },
  variants: {
    color: {
      light: {
        figure: 'bg-white',
        caption: 'text-black',
      },
      dark: {
        figure: 'bg-black',
        caption: 'text-white',
      },
    },
  },
});

// variantsを指定
const { figure, avatar, caption } = card({ color: 'dark' });

figure()
// => "w-48 p-4 border-2 border-solid text-center bg-black"

avatar()
// => "inline-block w-full"

caption()
// => "mt-2 font-bold text-white"
```

本記事ではSlotについて、これ以上言及はしませんが、[Slotの合成](https://www.tailwind-variants.org/docs/slots#compound-slots)や[レスポンシブなVariantsとの併用](https://www.tailwind-variants.org/docs/slots#slots-with-responsive-variants)も行うことができます。

### スタイルの上書き

`class` / `className`キーでスタイルの上書きも簡単にできます。

```tsx
import { tv } from 'tailwind-variants';

const button = tv({
  base: 'text-white p-4 bg-blue-500',
});

button({ class: 'bg-red-500' })
// => "text-white p-4 bg-red-500"

// もしくはclassNameでも同様
button({ className: 'bg-red-500' })
// => "text-white p-4 bg-red-500"
```

`slots`を使った場合でも、同様に`class` / `className`キーで上書きが可能です。

```tsx
const card = tv({
  slots: {
    figure: 'w-48 p-4 border-2 border-solid bg-gray-100 text-center',
    avatar: 'inline-block w-full',
    caption: 'mt-2 text-gray-900 font-bold',
  },
});

const { figure } = card();

figure({ class: 'text-start' });
// => "w-48 p-4 border-2 border-solid bg-gray-100 text-start"
// text-centerがtext-startに上書きされる
```

### スタイルの拡張

[`extend`](https://www.tailwind-variants.org/docs/composing-components#using-the-extend-prop)キーを用いてスタイルの拡張を行うこともできます。

```tsx
const baseButton = tv({
  base: 'p-4 bg-gray-100',
});

// extendで拡張
const successButton = tv({
  extend: baseButton,
  base: 'bg-green-700 text-white',
});

successButton()
// => "p-4 bg-green-700 text-white"
```

もしくは以下のように関数の戻り値を結合する方法でも可能です。

```tsx
const baseButton = tv({
  base: 'p-4 bg-gray-100',
});

const successButton = tv({
  base: [baseButton(), 'bg-green-700 text-white'],
});
successButton()
// => "p-4 bg-green-700 text-white"
```

スタイルの拡張は`base`に限った話ではなく、`variants`や`slots`などのその他のキーを拡張することも可能です。以下は`base`に加え`variants`を拡張した例です。

```tsx
const baseButton = tv({
  base: 'p-4 bg-gray-100',
  variants: {
    size: {
      small: 'p-2 text-sm',
      large: 'p-6 text-lg',
    },
  },
});

const successButton = tv({
  extend: baseButton,
  base: 'bg-green-700 text-white',
  variants: {
    disable: {
      true: 'opacity-20 pointer-events-none',
    },
  },
});

successButton({ size: 'small', disable: true });
// => "bg-green-700 text-white opacity-20 pointer-events-none p-2 text-sm"
```

## おわりに

今後ライブラリの開発が進むにつれて、Tailwind Variantsを検討する機会が増えそうと思い、本記事を書いてみました。本記事で紹介した内容はあくまでTailwind Variantsの機能の一部にしか過ぎないので、興味がある方はぜひ使ってみてください！

## 参考

https://www.tailwind-variants.org