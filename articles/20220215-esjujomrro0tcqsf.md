---
title: "imgタグにwidth/heightをnpm-scriptsで自動付与する"
emoji: "🐕"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["html", "npm", "nodejs"]
published: true
---

# 概要

`npm-scripts`で`img`に自動で**width/height**を付与する方法です。

https://github.com/jsdom/jsdom

Node.js上でDOM操作をするために、`jsdom`というモジュールを使います。
わりかし思いつきで書いたコードなので、考慮不足等々あったらご指摘ください（というか誰か最適化してくれ）。

# 前提

- Mac環境のみ検証済み（Windowsは未検証です。適宜調整してください）
- ローカルにある画像が対象

# 参考リポジトリ

全体のコードは以下リポジトリに置いてあるので気になった方は参考にしてもらえると幸いです。

https://github.com/yend724/sample-auto-set-img-size

# npm-scriptsの実装

## 大まかな流れ

1. Node.jsでHTMLファイルを取得
2. `jsdom`を使用して、画像のパスを取得
3. `image-size`を使用して画像のサイズを取得
4. `img`に**width/height**を付与する
5. **width/height**が付与されたHTMLファイルを吐き出す

## 想定ディレクトリ

以下のディレクトリ構造を想定しています。

```shell
.
├── README.md
├── package.json
├── script.js
└── src
    ├── assets
    │   └── img
    │       ├── 1920-1080.png
    │       ├── 1920-1440.png
    │       ├── 960-540.png
    │       └── 960-720.png
    └── index.html
```

**width/height**を記述していない`src/index.html`から、`npm-scripts`を使って**width/height**を付与した`dist/index.html`を吐き出します。

## モジュールのインストール

必要なモジュールをインスールします。

```shell:shell
$ yarn add --dev cpx html-minifier image-size jsdom
```

## スクリプトの作成

以下のようなスクリプトを作成します。

```js:script.js
const fs = require("fs");
const path = require("path");
const cpx = require("cpx");
const jsdom = require("jsdom");
const sizeOf = require("image-size");
const { minify } = require("html-minifier");

// プロジェクトのパス
const root = path.join(__dirname, "/");
const srcRoot = path.join(root, "src/");
const distRoot = path.join(root, "dist/")

// fsでsrc/index.htmlを取得
const html = fs.readFileSync(`${path.join(srcRoot, "index.html")}`, "utf-8");
// jsdomでDOM操作できるように
const { JSDOM } = jsdom;
const dom = new JSDOM(html);
const doc = dom.window.document;

// picture > source と img を取得
const sources = doc.querySelectorAll("picture > source");
const imgs = doc.querySelectorAll("img");

// 画像のパスを取得する正規表現
const regexp = /\S+\.(jpg|png|gif|webp)/g;
sources.forEach(source => {
  // srcsetから画像のパスだけ取得する
  // 例えば
  // srcset="./assets/img/960-540.png, ./assets/img/1920-1080.png 2x"
  // から
  // "./assets/img/960-540.png"と"./assets/img/1920-1080.png"
  // を抽出する
  const srcset = source.getAttribute("srcset");
  const matchs = [...srcset.matchAll(regexp)];

  if(matchs.length > 0){
    // srcsetの1つ目の画像のパスが対象
    // 例えば
    // srcset="./assets/img/960-540.png, ./assets/img/1920-1080.png 2x"
    // なら
    // "./assets/img/960-540.png"
    // が対象となる
    const src = matchs[0][0];
    // image-sizeを使用して画像のサイズを取得
    const dimensions = sizeOf(path.join(srcRoot, src));
    // width/heightをsourceタグに付与
    source.setAttribute("width", dimensions.width);
    source.setAttribute("height", dimensions.height);
  }
});

imgs.forEach(img => {
  const src = img.getAttribute("src");
  // image-sizeを使用して画像のサイズを取得
  const dimensions = sizeOf(path.join(srcRoot, src));
  // width/heightをimgタグに付与
  img.setAttribute("width", dimensions.width);
  img.setAttribute("height", dimensions.height);
});

// htmlファイルを圧縮（必須な操作ではないが、jsdomで吐き出されるソースが少し歪なので圧縮する）
const mini = minify(dom.serialize(), {
  collapseWhitespace: true,
  minifyCSS: true,
  minifyJS: true,
});

// distディレクトリがなかったらdistを作成
if(!fs.existsSync(distRoot)){
  fs.mkdirSync(`${root}/dist/`, { recursive: true }, (err) => {
    if (err) throw err;
  });
}
// dist/index.htmlにwidth/heightを付与したファイルを吐き出す
fs.writeFile(`${root}dist/index.html`, mini, error => {
  if (error) throw error;
});
// dist/assets/img/以下に画像ファイルをコピー
cpx.copy(`${srcRoot}assets/img/*.{jpg,png,gif,webp}`, `${root}dist/assets/img/`, error => {
  if (error) throw error;
})
```

## ビルドしてみる

`package.json`の必要な記述を追加してビルドします。

```json:package.json
{
  // 略
  "scripts": {
    "build": "node script.js"
  }
  // 略
}
```

```shell:shell
$ yarn build
```

上記コマンドでビルドすると以下のように`img`と`source`に**width/height**が付与されることを確認できます。

```html
<picture>
  <source
    srcset="./assets/img/960-540.png, ./assets/img/1920-1080.png 2x" media="(min-width: 1000px)" alt="16:9" />
  <source srcset="./assets/img/960-720.png, ./assets/img/1920-1440.png 2x" alt="4:3" />
  <img src="./assets/img/1920-1080.png" alt="16:9" />
</picture>
```
↓
```html
<picture>
  <source srcset="./assets/img/960-540.png, ./assets/img/1920-1080.png 2x" media="(min-width: 1000px)" alt="16:9" width="960" height="540">
  <source srcset="./assets/img/960-720.png, ./assets/img/1920-1440.png 2x" alt="4:3" width="960" height="720">
  <img src="./assets/img/1920-1080.png" alt="16:9" width="1920" height="1080">
</picture>
```

# まとめ

`npm-scripts`で**width/height**を自動付与する方法でした。
この記事を書くにあたって`jsdom`をはじめて知ったのですが、めちゃくちゃ便利ですね。
スクレイピングでよく使われているようですが、Web制作の環境づくりでも色々使い道がありそうです。
今回のコードはあまり汎用性のあるコードではないかもしれませんので、各々の環境に合わせて調整していただけると幸いです。

# 参考

https://github.com/jsdom/jsdom
https://github.com/image-size/image-size
https://github.com/mysticatea/cpx
https://github.com/kangax/html-minifier
https://zenn.dev/ko_yelie/articles/2d040d2750b751
