---
title: "useReducerを使ってフォームの状態管理をする"
emoji: "🌊"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["React", "JavaScript"]
published: true
---

## 概要

`useReducer`を使用してフォームの状態管理をすると、すっきりとしたコードが書けるよという話です。

## フォームとReact

Reactのフォームは公式ドキュメントにも記載があります。[フォーム – React](https://ja.reactjs.org/docs/forms.html)

内容としてはクラスコンポーネントの記述なので`setState`で状態管理をする方法が書かれています。ですが時代は関数コンポーネント。そこで**React Hooks**を使ってフォームの状態管理を行なっていきたいと思います。

## useStateを使用したフォームの状態管理

実際に、**React Hooks**で記載するとどうなるか、まず思いつくのが`useState`での状態管理ですね。

以下にシンプルな例を示します。

```jsx:title=jsx
import React, { useState } from "react";

const useStateForm = () => {
  const [name, setName] = useState("");

  const onSubmitForm = (e) => {
    e.preventDefault();
    const obj = {
      name: name,
    };
    alert(JSON.stringify(obj));
  };

  const onChangeName = (e) => {
    setName(e.currentTarget.value);
  };

  return (
    <div>
      <h1>useState を使用したフォームの例</h1>
      <form onSubmit={onSubmitForm}>
        <div>
          <label>
            name:
            <input type="text" value={name} onChange={onChangeName} />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default useStateForm;
```

上記のコードはとくに問題ありません。inputのvalueに対象のstateを渡して、`onChange`でstateの値を更新しています。Submitボタンをクリックすることで、今のstateを確認できます。

では、次にstateの数が増加した時のコードを書いてみます。

```jsx:title=jsx
import React, { useState } from "react";

const useStateForm = () => {
  const [name, setName] = useState("");
  const [age, setAge] = useState(0);
  const [email, setEmail] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const onSubmitForm = (e) => {
    e.preventDefault();
    const obj = {
      name: name,
      age: age,
      email: email,
      isPublic: isPublic,
    };
    alert(JSON.stringify(obj));
  };

  const onChangeName = (e) => {
    setName(e.currentTarget.value);
  };

  const onChangeAge = (e) => {
    setAge(e.currentTarget.value);
  };

  const onChangeEmail = (e) => {
    setEmail(e.currentTarget.value);
  };

  const onChangeIsPublic = (e) => {
    const nextValue = !isPublic;
    setIsPublic(nextValue);
  };

  return (
    <div>
      <h1>useState を使用したフォームの例</h1>
      <form onSubmit={onSubmitForm}>
        <div>
          <label>
            name:
            <input type="text" value={name} onChange={onChangeName} />
          </label>
        </div>
        <div>
          <label>
            age:
            <input type="number" value={age} onChange={onChangeAge} min="0" />
          </label>
        </div>
        <div>
          <label>
            e-mail:
            <input type="email" value={email} onChange={onChangeEmail} />
          </label>
        </div>
        <div>
          <label>
            isPublic:
            <input
              type="checkbox"
              checked={isPublic}
              onChange={onChangeIsPublic}
            />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default useStateForm;
```

`name`に加え、`age`、`email`、`isPublic`と管理するstateが4つに増えました。

まだなんとか見れなくもないですが、急に読みづらくなった印象です。似通った処理にも関わらず、処理が別々の関数に分けられてしまっています。同様にstateも別々に管理されています。これ以上stateが増えようものなら、スパゲティコードになる未来が予測できますね。

## useReducerを使う

そこでもう少しわかりやすいコードにしようという時に使えるのが`useReducer`です。`useReducer`を使うと処理とstateをまとめることができます。

```jsx:title=jsx
import React, { useReducer } from "react";

// state に必要な初期値をまとめる
const initialState = {
  name: "",
  age: 0,
  email: "",
  flavor: "grapefruit",
  isPublic: false,
};

// 処理を reducer としてまとめることができる
const reducer = (state, action) => {
  switch (action.type) {
    case "HANDLE_INPUT_TEXT":
      return {
        ...state,
        [action.field]: action.payload,
      };
    case "HANDLE_CHECKBOX":
      const nextValue = !state.isPublic
      return {
        ...state,
        [action.field]: nextValue,
      };
    default:
      throw new Error();
  }
};

const useReducerForm = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const onSubmitForm = (e) => {
    e.preventDefault();
    alert(JSON.stringify(state));
  };

  return (
    <div>
      <h1>useReducer を使用したフォームの例</h1>
      <form onSubmit={onSubmitForm}>
        <div>
          <label>
            name:
            <input
              type="text"
              value={state.name}
              onChange={(e) =>
                dispatch({
                  type: "HANDLE_INPUT_TEXT",
                  field: "name",
                  payload: e.currentTarget.value,
                })
              }
            />
          </label>
        </div>
        <div>
          <label>
            age:
            <input
              type="number"
              value={state.age}
              min="0"
              onChange={(e) =>
                dispatch({
                  type: "HANDLE_INPUT_TEXT",
                  field: "age",
                  payload: e.currentTarget.value,
                })
              }
            />
          </label>
        </div>
        <div>
          <label>
            e-mail:
            <input
              type="email"
              value={state.email}
              onChange={(e) =>
                dispatch({
                  type: "HANDLE_INPUT_TEXT",
                  field: "email",
                  payload: e.currentTarget.value,
                })
              }
            />
          </label>
        </div>
        <div>
          <label>
            isPublic:
            <input
              type="checkbox"
              checked={state.isPublic}
              onChange={(e) => {
                dispatch({
                  type: "HANDLE_CHECKBOX",
                  field: "isPublic",
                });
              }}
            />
          </label>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default useReducerForm;
```

`state`が一箇所にまとまり、また処理もreducerとして一箇所にまとめることができました。同一な処理は同一な`action`にすることで二度書く必要がないので、全体的にすっきりとした記述になります。また新しい処理を拡張する際にも、`action`とそれに伴う条件分岐を増やすだけなので非常に楽ですね。

## まとめ

`useReducer`を使用することでフォームの処理がすっきりと書ける（場合がある）ということでした。フォームの項目が少ない場合や処理が単純な場合は`useState`が適している場合もあるので、その辺りはうまく使い分けたいとですね。

## 参考

[フォーム – React](https://ja.reactjs.org/docs/forms.html)
[フック API リファレンス – React](https://ja.reactjs.org/docs/hooks-reference.html#usereducer)
[useReducer Form Example. This is a quick and dirty example of… | by Sam Dent | The Startup | Medium](https://medium.com/swlh/usereducer-form-example-16675fa60229)
