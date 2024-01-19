---
title: "【Three.js】ShaderMaterialを使ってテクスチャを画面にフィットさせる"
emoji: "📌"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["threejs", "glsl", "shader"]
published: true
published_at: 2024-01-18 18:00
---

Three.jsで`ShaderMaterial`を使ってテクスチャをブラウザの画面にフィットさせる方法について紹介します。この記事では、開発環境として[Vite](https://ja.vitejs.dev/)を採用していますが、紹介する考え方は他の開発環境でも同様に適用可能です。

## 全体のコードの概要

ここでは、`Plane`メッシュを作成し、`ShaderMaterial`を使用してテクスチャを適用する方法を紹介します。詳細なコードは以下のリンクから確認できます。

https://github.com/yend724/yend-playground/blob/main/src/three-fit-texure/assets/ts/index.ts

HTMLはシェーダー用の`script`要素と`canvas`要素を含む以下の構成を想定しています。

```html:HTML
<!-- script要素 -->
<script id="vertexShader" type="x-shader/x-vertex">
  //...頂点シェーダー
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
  //...フラグメントシェーダー
</script>

<!-- canvas要素 -->
<canvas id="canvas"></canvas>
```

## Planeを画面サイズと同じ大きさにする

`PlaneGeometry`のサイズを`2`に設定しています。`vertexShader`で、MVPの変換を行わず、頂点の`position`をそのまま`gl_Position`に渡しています。結果として、描画される頂点座標は何も変換がされていない`(-1,-1,-1)`から`(1,1,1)`までの範囲（正規化デバイス座標）に収まります。`PlaneGeometry`のサイズを`2`に設定することで、`Plane`は画面サイズにぴったり合うようになります。

参考：[WebGL のモデル、ビュー、投影](https://developer.mozilla.org/ja/docs/Web/API/WebGL_API/WebGL_model_view_projection)

```ts:PlaneGeometry
const geometry = new THREE.PlaneGeometry(2, 2);
```

```glsl:vertexShader
varying vec2 vUv;
void main() {
  vUv = uv;
  // MVPの変換を行わないので、そのままのpositionを渡す
  gl_Position = vec4(position, 1.0);
}
```

カメラに関しては、~~`PerspectiveCamera`や`OrthographicCamera`の代わりに、基本クラスの`Camera`を使用します~~何も設定していない`OrthographicCamera`を使用します。

:::message
2024-01-18 追記:
こちら[@focru_ino](https://x.com/focru_ino/status/1748193817159991356)さんから基本クラスの`Camera`から直接インスタンスを作成することが非推奨であることを教えていただいたので修正します。以降は`OrthographicCamera`を使用します。
参考：[Camera – three.js doc](https://threejs.org/docs/#api/en/cameras/Camera)
:::

これは、`vertexShader`でMVP変換を行わないので、カメラの設定の影響を受けないためです。ただし、描画するにあたり`renderer`にはカメラオブジェクトが必須なため、カメラ自体は作成する必要があります。

```ts:camera
const camera = new THREE.OrthographicCamera();
// パフォーマンスを考慮する場合、matrixAutoUpdateをfalseにする
camera.matrixAutoUpdate = false;
```

### リサイズ処理

ブラウザのリサイズ時は、`renderer`を更新して適切な表示を維持します。また`uniform`で渡している`uScreenAspect`（[ShaderMaterialの設定](#shadermaterial%E3%81%AE%E8%A8%AD%E5%AE%9A)を参照）の更新も忘れないようにしてください。

```ts:Planeの大きさを変更する
// windowのリサイズ処理
const onResize = () => {
  const windowSize = getWindowSize();

  // uniformで渡しているwindowのアスペクト比を更新
  material.uniforms.uScreenAspect.value = windowSize.aspect;

  // rendererを更新
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(windowSize.width, windowSize.height);
};
window.addEventListener('resize', onResize);
```

## ShaderMaterialの設定

`ShaderMaterial`に渡す`uniform`変数は以下のように設定します。

`uniform`変数として、`uTexture`、`uTextureAspect`、`uScreenAspect`を設定しています。`uTextureAspect`はテクスチャのアスペクト比、`uScreenAspect`は画面のアスペクト比です。

```ts:ShaderMaterialの設定
// uniform変数の一覧
const uniforms = {
  uTexture: {
    value: texture,
  },
  uTextureAspect: {
    value: textureAspect,
  },
  uScreenAspect: {
    value: screenAspect,
  },
};

// ShaderMaterialの設定
const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: VertexShader,
  fragmentShader: FragmentShader,
});
```

## テクスチャをブラウザの画面にフィットさせる

ブラウザの画面に合わせてテクスチャをフィットさせるには、ブラウザとテクスチャのアスペクト比に基づいてUV座標を計算します。ここでは画面にフィットさせるいくつかのパターンを紹介します。

「[Planeを画面サイズと同じ大きさにする](#plane%E3%82%92%E7%94%BB%E9%9D%A2%E3%82%B5%E3%82%A4%E3%82%BA%E3%81%A8%E5%90%8C%E3%81%98%E5%A4%A7%E3%81%8D%E3%81%95%E3%81%AB%E3%81%99%E3%82%8B)」の箇所で、すでにコードを見てしまいましたが、頂点シェーダーは次の共通のコードを使用しています。頂点シェーダーでは`varying`を用いたUV座標の受け渡しを行なっています。`vUv`はフラグメントシェーダーに渡すための変数です。

```glsl:vertexShader
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
```

### 幅・高さともに画面と同じ大きさにする

この方法はテクスチャのアスペクト比を無視し、画面に完全にフィットさせます。CSSの`width:100%;height:100%;`のような効果を得られます。

```glsl:fragmentShader
uniform sampler2D uTexture;
varying vec2 vUv;
void main() {
  vec4 color = texture2D(uTexture, vUv);
  gl_FragColor = color;
}
```

[幅・高さともに画面と同じ大きさにするDEMO](https://playground.yend.dev/three-fit-texure/fit/)

### テクスチャのアスペクト比を保ったまま幅を画面にフィットさせる

この方法はテクスチャのアスペクト比を保った状態で、幅のみを画面にフィットさせます。CSSの`width:100%;height:auto;`のような効果を得られます。

```glsl:fragmentShader
uniform sampler2D uTexture;
uniform float uTextureAspect;
uniform float uScreenAspect;
varying vec2 vUv;

void main() {
  // アスペクト比からテクスチャの比率を計算
  // 幅は常に1.0にする
  vec2 ratio = vec2(
    1.0,
    uTextureAspect / uScreenAspect
  );
  // 中央に配置するための計算
  vec2 textureUv = vec2(
    (vUv.x - 0.5) * ratio.x + 0.5,
    (vUv.y - 0.5) * ratio.y + 0.5
  );

  vec4 color = texture2D(uTexture, textureUv);
  // テクスチャの範囲外は黒にする
  vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
  float outOfBounds = float(textureUv.x < 0.0 || textureUv.x > 1.0 || textureUv.y < 0.0 || textureUv.y > 1.0);
  gl_FragColor = mix(color, black, outOfBounds);
}
```

[テクスチャのアスペクト比を保ったまま幅を画面にフィットさせるDEMO](https://playground.yend.dev/three-fit-texure/fit-width/)

### テクスチャのアスペクト比を保ったまま高さを画面にフィットさせる

この方法はテクスチャのアスペクト比を保った状態で、高さのみを画面にフィットさせます。CSSの`width:auto;height:100%;`のような効果を得られます。

```glsl:fragmentShader
uniform sampler2D uTexture;
uniform float uTextureAspect;
uniform float uScreenAspect;
varying vec2 vUv;

void main() {
  // アスペクト比からテクスチャの比率を計算
  // 高さは常に1.0にする
  vec2 ratio = vec2(
    uScreenAspect / uTextureAspect,
    1.0
  );
  // 中央に配置するための計算
  vec2 textureUv = vec2(
    (vUv.x - 0.5) * ratio.x + 0.5,
    (vUv.y - 0.5) * ratio.y + 0.5
  );

  vec4 color = texture2D(uTexture, textureUv);
  // テクスチャの範囲外は黒にする
  vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
  float outOfBounds = float(textureUv.x < 0.0 || textureUv.x > 1.0 || textureUv.y < 0.0 || textureUv.y > 1.0);
  gl_FragColor = mix(color, black, outOfBounds);
}
```

[テクスチャのアスペクト比を保ったまま高さを画面にフィットさせるDEMO](https://playground.yend.dev/three-fit-texure/fit-height/)

### 画面を覆うように表示する

この方法はテクスチャを画面に覆うように表示させます。テクスチャのアスペクト比は保持され、CSSの`background-size:cover;`のような効果を得られます。

```glsl:fragmentShader
uniform sampler2D uTexture;
uniform float uTextureAspect;
uniform float uScreenAspect;
varying vec2 vUv;

void main() {
  // アスペクト比からテクスチャの比率を計算
  vec2 ratio = vec2(
    min(uScreenAspect / uTextureAspect, 1.0),
    min(uTextureAspect / uScreenAspect, 1.0)
  );
  // 中央に配置するための計算
  vec2 textureUv = vec2(
    (vUv.x - 0.5) * ratio.x + 0.5,
    (vUv.y - 0.5) * ratio.y + 0.5
  );

  vec4 color = texture2D(uTexture, textureUv);
  gl_FragColor = color;
}
```

[画面を覆うように表示するDEMO](https://playground.yend.dev/three-fit-texure/cover/)

### 画面に収まるように表示する

この方法はテクスチャを画面に収まるように表示させます。テクスチャのアスペクト比は保持され、CSSの`background-size:contain;`のような効果を得られます。

```glsl:fragmentShader
uniform sampler2D uTexture;
uniform float uTextureAspect;
uniform float uScreenAspect;
varying vec2 vUv;

void main() {
  // アスペクト比からテクスチャの比率を計算
  vec2 ratio = vec2(
    max(uScreenAspect / uTextureAspect, 1.0),
    max(uTextureAspect / uScreenAspect, 1.0)
  );
  // 中央に配置するための計算
  vec2 textureUv = vec2(
    (vUv.x - 0.5) * ratio.x + 0.5,
    (vUv.y - 0.5) * ratio.y + 0.5
  );

  vec4 color = texture2D(uTexture, textureUv);
  // テクスチャの範囲外は黒にする
  vec4 black = vec4(0.0, 0.0, 0.0, 1.0);
  float outOfBounds = float(textureUv.x < 0.0 || textureUv.x > 1.0 || textureUv.y < 0.0 || textureUv.y > 1.0);
  gl_FragColor = mix(color, black, outOfBounds);
}
```

[画面に収まるように表示するDEMO](https://playground.yend.dev/three-fit-texure/contain/)

### 画面に収まるように表示しつつリピートする

この方法はテクスチャを画面に収めつつ、空いたスペースにテクスチャをリピートされるように表示させます。CSSの`background-size:contain;background-repeat:repeat;`とのような効果を得られます。

```glsl:fragmentShader
uniform sampler2D uTexture;
uniform float uTextureAspect;
uniform float uScreenAspect;
varying vec2 vUv;

void main() {
  // アスペクト比からテクスチャの比率を計算
  vec2 ratio = vec2(
    max(uScreenAspect / uTextureAspect, 1.0),
    max(uTextureAspect / uScreenAspect, 1.0)
  );
  // 中央に配置するための計算
  vec2 textureUv = vec2(
    (vUv.x - 0.5) * ratio.x + 0.5,
    (vUv.y - 0.5) * ratio.y + 0.5
  );

  // fractでリピートする
  vec4 color = texture2D(uTexture, fract(textureUv));
  gl_FragColor = color;
}
```

[画面に収まるように表示しつつリピートするDEMO](https://playground.yend.dev/three-fit-texure/contain-repeat/)

## おわりに

`ShaderMaterial`を使用してテクスチャをブラウザの画面にフィットさせる方法についてご紹介しました。本記事の内容は非常に基本的なものですが、細かい箇所で忘れがちな点も多いため、自分用の備忘録も兼ねてまとめてみました。改めて思考が整理されたので良かったです。

## 参考
https://threejs.org/
https://zenn.dev/bokoko33/articles/bd6744879af0d5