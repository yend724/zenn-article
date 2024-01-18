---
title: "【Three.js】ShaderMaterialを使ってテクスチャを画面にフィットさせる"
emoji: "📌"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["threejs", "glsl", "shader"]
published: true
published_at: 2024-01-18 18:00
---

Three.jsで`ShaderMaterial`を使ってテクスチャをブラウザの画面にフィットさせる方法について紹介します。この記事では、開発環境としてViteを採用していますが、紹介する考え方は他の開発環境でも同様に適用可能です。

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

Planeを画面サイズと同じ大きにするため、`OrthographicCamera`を使用します。このカメラは平行投影を表現することが可能で遠近感を持たないため、`Plane`メッシュを画面サイズに合わせるのが容易です。

```ts:OrthographicCamera
// OrthographicCameraでwindowサイズを指定
const camera = new THREE.OrthographicCamera(
  windowSize.width / -2,
  windowSize.width / 2,
  windowSize.height / 2,
  windowSize.height / -2,
  1,
  10
);
// z軸の位置はnear,farの間に入っていれば良い（今回だと1 ~ 10）
camera.position.z = 5;
scene.add(camera);
```

次に、`PlaneGeometry`で画面サイズを指定し、`Plane`を画面と同じサイズにします。

```ts:PlaneGeometry
const geometry = new THREE.PlaneGeometry(windowSize.width, windowSize.height);
```

### リサイズ処理

ブラウザのリサイズ時は、`renderer`、`camera`、`geometry`を更新して適切な表示を維持します。また`uniform`で渡している`uScreenAspect`（[ShaderMaterialの設定](#shadermaterial%E3%81%AE%E8%A8%AD%E5%AE%9A)を参照）の更新も忘れないようにしてください。

```ts:Planeの大きさを変更する
// windowのリサイズ処理
const onResize = () => {
  const windowSize = getWindowSize();

  // planeのサイズをwindowのサイズに合わせる
  plane.geometry = new THREE.PlaneGeometry(
    windowSize.width,
    windowSize.height
  );

  // uniformで渡しているwindowのアスペクト比を更新
  material.uniforms.uScreenAspect.value = windowSize.aspect;

  // cameraを更新
  camera.left = windowSize.width / -2;
  camera.right = windowSize.width / 2;
  camera.top = windowSize.height / 2;
  camera.bottom = windowSize.height / -2;
  camera.updateProjectionMatrix();

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
  side: THREE.DoubleSide,
  uniforms,
  vertexShader: VertexShader,
  fragmentShader: FragmentShader,
});
```

## テクスチャをブラウザの画面にフィットさせる

ブラウザの画面に合わせてテクスチャをフィットさせるには、ブラウザとテクスチャのアスペクト比に基づいてUV座標を計算します。ここでは画面にフィットさせるいくつかのパターンを紹介しますが、頂点シェーダーは次の共通のコードを使用しています。

頂点シェーダーでは、MVP行列による座標変換と`varying`を用いたUV座標の受け渡しを行なっています。`vUv`はフラグメントシェーダーに渡すための変数です。

```glsl:vertexShader
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition =  viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
```

### 幅・高さともに画面と同じ大きさにする

この方法はテクスチャのアスペクト比を無視し、画面に完全にフィットさせます。CSSの`width:100%,height:100%`のような効果を得られます。

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

この方法はテクスチャのアスペクト比を保った状態で、幅のみを画面にフィットさせます。CSSの`width:100,height:auto`のような効果を得られます。

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

この方法はテクスチャのアスペクト比を保った状態で、高さのみを画面にフィットさせます。CSSの`width:auto,height:100%`のような効果を得られます。

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

この方法はテクスチャを画面に覆うように表示させます。テクスチャのアスペクト比は保持され、CSSの`background-size:cover`のような効果を得られます。

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

この方法はテクスチャを画面に収まるように表示させます。テクスチャのアスペクト比は保持され、CSSの`background-size:contain`のような効果を得られます。

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

この方法はテクスチャを画面に収めつつ、空いたスペースにテクスチャをリピートされるように表示させます。CSSの`background-size:contain,background-repeat:repeat;`とのような効果を得られます。

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
https://threejs.org/docs/#api/en/cameras/OrthographicCamera
https://zenn.dev/bokoko33/articles/bd6744879af0d5