---
title: '結局 useEffect はいつ使えばいいのか'
emoji: '🐈'
type: 'tech' # tech: 技術記事 / idea: アイデア
topics: ['React']
published: true
published_at: 2024-07-11 14:00
---

`useEffect`はReactの中でも扱いの難しいフックとして知られています。Reactで開発を行う中で`useEffect`を検討するタイミングや適切な使い方について悩んだ経験のある方も多いのではないでしょうか。

本記事では、`useEffect`の目的を把握し、どのような場合に`useEffect`の使用を検討すべきかについて考えていきたいと思います。

## コンポーネントの純粋性と副作用

まず`useEffect`について考える前に、コンポーネントの純粋性について理解する必要があります。Reactにおいて純粋性は重要な概念の1つです。

前提として、Reactではすべてのコンポーネントが[純関数](https://en.wikipedia.org/wiki/Pure_function)あることを仮定しています。

> Reactは、あなたが書くすべてのコンポーネントが純関数であると仮定しています。
> 参照：https://ja.react.dev/learn/keeping-components-pure#purity-components-as-formulas

純関数とは計算だけを行い、他には何もしない関数のことです。純関数には次のような特徴があります。

> - 自分の仕事に集中する。呼び出される前に存在していたオブジェクトや変数を変更しない。
> - 同じ入力には同じ出力。同じ入力を与えると、純関数は常に同じ結果を返す。
>
> 参照：https://ja.react.dev/learn/keeping-components-pure#purity-components-as-formulas

Reactではコンポーネントも関数なので、前述した純関数の特徴をコンポーネントに当てはめることができます。すると、純粋なコンポーネントは次のような特徴を持つといえます。

- 冪等 (idempotent) である
- レンダー時に副作用がない
- ローカルな値以外を変更しない

原則として、**コンポーネントは純粋であるべき**です。これはReactにおいて、コンポーネントはコンポーネントの外に作用せず、入力が同じであれば常に同じ出力を返す必要があるということです。

:::message
Reactコンポーネントに対する入力は、[Props](https://ja.react.dev/learn/passing-Props-to-a-component)、[State](https://ja.react.dev/learn/state-a-components-memory)、[Context](https://ja.react.dev/learn/passing-data-deeply-with-context)であり、出力はJSXです。
:::

たとえば、次のようなコードは純粋なコンポーネントです。

```jsx:純粋なコンポーネントの例
const Counter = ({ count }: { count: nubmer }) => {
  return <div>Count: {count}</div>;
};
```

@[codesandbox](https://codesandbox.io/embed/react-pure-component-ncdhyc?file=%2Fsrc%2FApp.tsx)

上記のコンポーネントは、`count`という入力（`Props`）を受け取り、それを表示するシンプルなコンポーネントです。これは純粋なコンポーネントなため、入力（`Props`）として同じ`count`が与えられた場合には、常に同じ出力が返されます。

一方で、次のコードは純粋なコンポーネントではありません。

```jsx:純粋ではないコンポーネントの例
let count = 0;

const Counter = () => {
  count = count + 1;
  return <div>Count: {count}</div>;
};
```

@[codesandbox](https://codesandbox.io/embed/react-impure-component-8tm6k8?file=%2Fsrc%2FApp.tsx)

上記のコンポーネントは、レンダー時にコンポーネント外の`count`変数を変更しています。そのため、コンポーネントを複数回呼び出すと、入力は同じなのにも関わらず、出力が異なっています。

このような純粋ではないコンポーネントは予期せぬ挙動を引き起こしバグの原因となるため、避けるべきです。

これまでに見てきたように、Reactにおいて純粋性は重要な概念です。一方で実際のプログラミングではグローバルな変数へのアクセスやDOMの変更、データの更新などの[副作用（side effect）](<https://en.wikipedia.org/wiki/Side_effect_(computer_science)>)が必要になることもあります。

コンポーネントのレンダリングプロセスは常に純粋であるべきですが、プログラミングを行う中で副作用を完全に排除することはできません。そこで、レンダリングを純粋に保ちつつ、副作用を安全に扱う方法が必要となります。

Reactでは、副作用を安全に扱うために、主に次の2つの方法を提供しています。

1. [イベントハンドラ](https://ja.react.dev/learn/responding-to-events)：ユーザーのアクションが実行された時にReactが呼び出す関数
2. [useEffect](https://ja.react.dev/reference/react/useEffect)：レンダリングに付随する副作用を扱うReactフック

上記のうち副作用は通常、イベントハンドラに属します。本記事では`useEffect`に焦点を当てているため、イベントハンドラについては詳しく触れませんが、決して副作用を扱う場所として、イベントハンドラよりも`useEffect`の方が優れているわけではありません。

むしろ`useEffect`は[避難ハッチ](https://ja.react.dev/learn/escape-hatches)であることを覚えておいてください。

## エフェクト（Effect）とは

前述したようにReactのレンダリングは純粋であるべきでした。副作用をレンダーの中に含めてはいけません。この原則はReactのルールとしても明示されています。

> 副作用はレンダー中に実行してはいけません。
> 参照：https://ja.react.dev/reference/rules/components-and-hooks-must-be-pure#side-effects-must-run-outside-of-render

ユーザーのアクションによって何かしらの副作用が生じる場合は、副作用をイベントハンドラに書くことでレンダリングを純粋に保つことができます。イベントハンドラを使用することで、そのコードをレンダー中に実行する必要がないことを、Reactに伝えることができます。

しかしながら、副作用のすべてが何かしらのイベントによって生じるわけではありません。そこで登場するのがエフェクトです。

> エフェクトは、特定のイベントによってではなく、レンダー自体によって引き起こされる副作用を指定するためのものです。
> 参照：https://ja.react.dev/learn/synchronizing-with-effects#what-are-effects-and-how-are-they-different-from-events

`useEffect`はその名の通り、エフェクトを扱うためのフックです。Reactは`useEffect`をエフェクトの目印として使用します。

エフェクトはイベントではなく、レンダーによって生じる副作用です。そのため`useEffect`はレンダリングとエフェクトを分離し、レンダー結果が画面に反映さるまで（[コミット](https://ja.react.dev/learn/render-and-commit)後まで）、コードの実行を遅らせるというわけです。

`useEffect`を使用することで、レンダリングを純粋に保ちつつ、適切にエフェクトを扱うことができます。

## `useEffect`はコンポーネントを外部システムと同期させる

エフェクトという概念について確認したところで、次はエフェクトが必要な場面について考えていきましょう。

Reactの`useEffect`フックは、コンポーネントを外部システムと同期させるために使用されます。公式ドキュメントでは次のように説明されています。

> `useEffect`は、コンポーネントを外部システムと同期させるためのReactフックです。
> 参照：https://ja.react.dev/reference/react/useEffect

### 外部システムとは

ここでいう「外部システム」とは、Reactによって制御されていないシステムのことを指します。具体的には以下のようなものが該当します。

- ネットワーク
- 何らかのブラウザAPI
- サードパーティライブラリやウィジェット

これらのシステムはReactの外部にあり、Reactの状態管理やレンダリングサイクルとは独立して動作します。

### コンポーネントと外部システムの同期

時には、自身が画面に表示されている間、常に外部システムと同期する必要のあるコンポーネントもあります。

たとえばリアルタイムで時刻を表示する`<Clock>`コンポーネントを考えてみましょう。

コンポーネントと現在時刻の同期は純粋な計算ではないので、レンダー中に行ってはいけません。以下はやっていはいけない実装例です。

```tsx:レンダー中に純粋ではない処理を行う
// Bad: レンダー中に現在時刻を取得する
const Clock = () => {
  // new Date() は冪等ではなく純粋でない
  const dateTime = new Date();
  return <div>{dateTime.toLocaleString()}</p>;
};
```

また現在時刻の同期は、ユーザーの操作に関係なく、コンポーネントのレンダリングに付随して行われるべきあり、これはすなわちエフェクトです。

上記を踏まえ、`<Clock>`コンポーネントを実装してみると次のようになります。

```tsx:純粋ではない処理をエフェクトで行う
// Good: 現在時刻の同期をエフェクトで行う
const Clock = () => {
  const [dateTime, setDateTime] = useState(() => new Date());

  // 現在時刻の同期はエフェクトとして実装する
  useEffect(() => {
    const id = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    // クリーンアップ
    return () => {
      clearInterval(id);
    };
  }, []);

  return <div>{dateTime.toLocaleString()}</p>;
};
```

@[codesandbox](https://codesandbox.io/embed/kzcwpg?preview&module=%2Fsrc%2FApp.tsx)

このように`useEffect`を使用することで、コンポーネントを外部システムと同期させることができます。

### 同期の開始と停止

`useEffect`を使用してコンポーネントと外部システムを同期させる際、エフェクトは「同期」のプロセスとして考えることができます。

基本的にエフェクトが行うのは次の2のことです。

1. 同期を開始（外部システムに接続する）
2. 同期を停止（外部システムから切断する）

忘れがちですが、多くのケースで同期の停止も必要です。なぜなら`useEffect`で何かしらの純粋ではない処理を実行したのであれば、コンポーネントがアンマウントされたときにその影響を元に戻す必要があるからです。

先ほどの`<Clock>`コンポーネントの`useEffect`をもう一度見直してみましょう。

```tsx:同期の開始と停止
useEffect(() => {
  // 同期を開始（接続）
  const id = setInterval(() => {
    setTime(new Date());
  }, 1000);

  // 同期を停止（切断）
  return () => {
    clearInterval(id);
  };
}, []);
```

このエフェクトでは、次のことが行われています。

1. 同期の開始：`setInterval`を使って時刻の更新を開始します。これは外部システムとの「接続」にあたります。
2. 同期の停止：クリーンアップ関数で`clearInterval`を呼び出します。これは「切断」にあたります。

Reactは、コンポーネントが再レンダリングされるたび、もしくは依存配列に指定した値が変化するたびに、前回のエフェクトをクリーンアップして、新しいエフェクトを実行します。これにより、エフェクトの同期プロセスが適切に行われます。

本記事では、これ以上エフェクトのライフサイクルについて言及しませんが、より詳しく知りたい場合は「[リアクティブなエフェクトのライフサイクル – React](https://ja.react.dev/learn/lifecycle-of-reactive-effects#each-effect-represents-a-separate-synchronization-process)」を参照してください。

## おわりに

冒頭でも述べたように、`useEffect`はReactの中でも扱いの難しいフックです。公式ドキュメントを読んでみても、その記述は多岐に渡り、使いこなすまでには時間がかかるかもしれません。

Reactの公式ドキュメントでは「[そのエフェクトは不要かも](https://ja.react.dev/learn/you-might-not-need-an-effect)」をはじめとして、アンチパターンの紹介も行われています。`useEffect`を使う際には、そのエフェクトが本当に必要かどうか、より適切な方法で実現できないかを常に考えることが重要です。

本記事の内容が、参考になれば幸いです。

## 参考文献

https://ja.react.dev/reference/react/useEffect
https://ja.react.dev/learn/synchronizing-with-effects
https://ja.react.dev/learn/you-might-not-need-an-effect
https://ja.react.dev/learn/keeping-components-pure
https://ja.react.dev/reference/rules/components-and-hooks-must-be-pure#side-effects-must-run-outside-of-render
https://ja.react.dev/learn/lifecycle-of-reactive-effects
https://overreacted.io/a-complete-guide-to-useeffect/
https://zenn.dev/uhyo/articles/useeffect-taught-by-extremist
https://zenn.dev/yumemi_inc/articles/react-effect-simply-explained
