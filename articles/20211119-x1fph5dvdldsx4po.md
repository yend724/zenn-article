---
title: "React で requestAnimationFrame を使う"
emoji: "💬"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["JavaScript", "React"]
published: true
---

# 概要

アニメーションでよく使用される `requestAnimationFrame`。
非常に便利で使いやすいメソッドなのですが、React で扱うには少々癖があったので、今回はそのことについて書いていこうと思います。

# 完成形

まずは今回解説するコードの完成形。

@[codepen](https://codepen.io/yend24/pen/ZEJmVZr)

START ボタンを押すとカウントの実行。STOP ボタンを押すとカウントの停止ができます。
シンプルなカウンターですが、この実装を完成として、ここまでの過程を考えていきます。

# requestAnimationFrame

まず最初に `requestAnimationFrame` でループする簡単な使い方を紹介します。

```js
const loop = () => {
  // 処理
  requestAnimationFrame(step);
};
// ループの実行
loop();
```

よくみる形ですね。コールバックで再帰的に関数を実行することでループを実現しています。
ループを止めるためには再帰呼び出しを止めるか、`cancelAnimationFrame` を使います。

https://developer.mozilla.org/ja/docs/Web/API/Window/requestAnimationFrame
https://developer.mozilla.org/ja/docs/Web/API/Window/cancelAnimationFrame

**再帰呼び出しを止めるパターン**

```js
let count = 0;
const loop = () => {
  // 処理
  if (count < 200) {
    // count が　200　より小さい時だけ
    requestAnimationFrame(loop);
  }
  count++;
};
// ループの開始
loop();
```

**`cancelAnimationFrame` の使用**

```js
let reqid;
let count = 0;
const loop = () => {
  reqid = requestAnimationFrame(loop);
  // 処理
  if (count >= 200) {
    // count が　200　より小さい時だけ
    cancelAnimationFrame(reqid);
  }
  count++;
};
// ループの開始
loop();
```

# React で requestAnimationFrame を使用する

順を追って実装していきます。

## シンプルに実装してみる

まずはシンプルに React に埋め込んでみます。

```jsx
const Component = () => {
  const loop = () => {
    // ループしたい処理
    requestAnimationFrame(loop);
  };
  React.useEffect(() => {
    loop();
  }, [loop]);

  //...略
};
```

一見良いように見えますが、コンポーネントが破棄されたときにループを止める必要がありますね。
したがって、`useEffect` のクリーンアップ関数として `cancelAnimationFrame` を使います。

しかし、`cancelAnimationFrame` を使うためには `requestAnimationFrame` から返される `requestID` が必要です。`requestID` を保持するために useRef を使用しましょう。

```jsx
const Component = () => {
  const reqIdRef = React.useRef();
  const loop = () => {
    // ループしたい処理
    reqIdRef.current = requestAnimationFrame(loop);
  };
  React.useEffect(() => {
    loop();
    return () => cancelAnimationFrame(reqIdRef.current);
  }, []);

  //...略
};
```

完璧ですね。

## 再描画を考える

では、次にフレームカウンターを実装してみましょう。

```jsx
const Component = () => {
  const reqIdRef = React.useRef();
  let counter = 0;

  const loop = () => {
    reqIdRef.current = requestAnimationFrame(loop);
    counter++;
  };

  React.useEffect(() => {
    loop();
    return () => cancelAnimationFrame(reqIdRef.current);
  }, []);

  return <div>{counter}</div>;
};
```

実際に上記を実装してみると `counter` が更新されないのがわかると思います。
理由としては単純で `useRef` は再描画をトリガーからです。
解決策として、`useState` を使います。

```jsx
const Component = () => {
  const reqIdRef = React.useRef();
  const [counter, setCounter] = React.useState(0);

  const loop = () => {
    reqIdRef.current = requestAnimationFrame(loop);
    setCounter(pre => ++pre);
  };

  React.useEffect(() => {
    loop();
    return () => cancelAnimationFrame(reqIdRef.current);
  }, []);

  return <div>{counter}</div>;
};
```

フレームカウンターが実装できました。

## Hooks に切り出してみる

少々このままでは煩わしいので Hooks に切り出してみます。

```jsx
// ループで実行したい処理 を callback関数に渡す
const useAnimationFrame = (callback = () => {}) => {
  const reqIdRef = React.useRef();
  const loop = () => {
    reqIdRef.current = requestAnimationFrame(loop);
    callback();
  };

  React.useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqIdRef.current);
  }, []);
};

const Component = () => {
  const [counter, setCounter] = React.useState(0);

  useAnimationFrame(() => {
    setCounter(prevCount => ++prevCount);
  });

  return (
    <div>
      <div>{counter}</div>
    </div>
  );
};
```

だいぶスッキリしましたね。機能としてはこれで完成です。

## パフォーマンスを考えてみる

リファクタリングとまでは言わないですが、パフォーマンスの点で気になるところがあるので書き換えてみます。

```jsx
// ループで実行したい処理 を callback関数に渡す
const useAnimationFrame = (callback = () => {}) => {
  const reqIdRef = React.useRef();
  // useCallback で callback 関数が更新された時のみ関数を再生成
  const loop = React.useCallback(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    callback();
  }, [callback]);

  React.useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqIdRef.current);
    // loop を依存配列に
  }, [loop]);
};
```

全体としてはこうなります。

```jsx
const useAnimationFrame = (callback = () => {}) => {
  const reqIdRef = React.useRef();
  const loop = React.useCallback(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    callback();
  }, [callback]);

  React.useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqIdRef.current);
  }, [loop]);
};

const Component = () => {
  const [counter, setCounter] = React.useState(0);

  // setCounter するたびに関数を再生成するのを防ぐ
  const countUp = React.useCallback(() => {
    setCounter(prevCount => ++prevCount);
  }, []);
  useAnimationFrame(countUp);

  return (
    <div>
      <div>{counter}</div>
    </div>
  );
};
```

少々冗長に見えますが、上記で無駄な関数の再生成が防げるようになりました。

## START と STOP ボタンを作る

それでは完成形のように START と STOP ボタンを実装します。

```jsx
// 第一引数に boolean をとるように修正
// - true ならループ
// - false なら停止
const useAnimationFrame = (isRunning, callback = () => {}) => {
  const reqIdRef = React.useRef();
  const loop = React.useCallback(() => {
    if (isRunning) {
      // isRunning が true の時だけループ
      reqIdRef.current = requestAnimationFrame(loop);
      callback();
    }
    // isRunning も依存配列に追加
  }, [isRunning, callback]);

  React.useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqIdRef.current);
  }, [loop]);
};

const Component = () => {
  const [counter, setCounter] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);

  const countUp = React.useCallback(() => {
    setCounter(prevCount => ++prevCount);
  }, []);
  useAnimationFrame(isRunning, countUp);

  return (
    <div>
      <div>{counter}</div>
      <button onClick={() => setIsRunning(true)}>START</button>
      <button onClick={() => setIsRunning(false)}>STOP</button>
    </div>
  );
};
```

引数に `isRunning` をとるように hooks を変更し、true ならループ実行、false ならループ停止を実装しました。
これで最初に載せたコードの完成となります！

# 少し応用

@[codepen](https://codepen.io/yend24/pen/QWMYqvp)

ただカウントアップするだけではつまらないので、一例として数字ルーレットアニメーションを実装してみました。
少し応用するだけで数字ルーレットアニメーションを簡単に実装できますので、使ってみたい方は参考にしてみてください。

# まとめ

React において `requestAnimationFrame` を扱う方法でした。
その性質上、パフォーマンスを考えるとだいぶ癖があるように感じました。
諸々検討した上で、問題が発生しないように使用できると良いですね。

# 参考

https://css-tricks.com/using-requestanimationframe-with-react-hooks/
https://bom-shibuya.hatenablog.com/entry/2020/10/27/182226
