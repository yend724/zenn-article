---
title: "【Three.js】ShaderMaterialを使ってテクスチャを画面にフィットさせる"
emoji: "📌"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["threejs", "glsl", "shader"]
published: false
---

Three.jsの`ShaderMaterial`を用いてテクスチャをブラウザの画面にフィットさせる方法を紹介します。本記事では開発環境として[Vite](https://ja.vitejs.dev/)を使用してますが、基本的な部分は他の環境でも活かせると思います。

## 全体のコード

本記事で紹介する方法の全体コードになります。ざっくり説明すると、`Plane`メッシュを1つ置いて、その`Plane`に`ShaderMaterial`でテクスチャを貼り付けているだけです。

https://github.com/yend724/yend-playground/blob/main/src/three-fit-texure/assets/ts/index.ts

HTML側には以下のような`canvas`要素と`script`要素が存在することを想定しています。`script`要素は後述するシェーダーのコードを記述するためのものです。

```html:HTML
<canvas id="canvas"></canvas>
```

```html:HTML
<script id="vertexShader" type="x-shader/x-vertex">
  //...頂点シェーダーのコード
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
  //...フラグメントシェーダーのコード
</script>
```

## Planeをブラウザの画面サイズと同じ大きさにする

まずは下準備として`Plane`をブラウザの画面サイズと同じ大きさにします。本記事では`PerspectiveCamera`ではなく`OrthographicCamera`を使用します。`OrthographicCamera`は奥行きの情報を持たないカメラなので、今回のように`Plane`メッシュを1つ画面サイズに合わせるだけであれば、遠近法を考慮する必要がなく個人的には楽だと思います。

`OrthographicCamera`の`left,right,top,bottom`をブラウザの画面サイズに合わせます。

```ts:OrthographicCamera
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

その後、`PlaneGeometry`にブラウザの画面サイズを指定することで、`Plane`をブラウザの画面サイズと同じ大きさにすることが簡単にできます。

```ts:PlaneGeometry
const geometry = new THREE.PlaneGeometry(windowSize.width, windowSize.height);
```

### リサイズ処理

リザイズ時には`PlaneGeometry`と`Camera`を更新します。

```ts:Planeの大きさを変更する
const onResize = () => {
  const windowSize = getWindowSize();

  plane.geometry = new THREE.PlaneGeometry(
    windowSize.width,
    windowSize.height
  );

  material.uniforms.uScreenAspect.value = windowSize.aspect;

  camera.left = windowSize.width / -2;
  camera.right = windowSize.width / 2;
  camera.top = windowSize.height / 2;
  camera.bottom = windowSize.height / -2;
  camera.updateProjectionMatrix();

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(windowSize.width, windowSize.height);
};
window.addEventListener('resize', onResize);
```

## uniform変数の定義

`ShaderMaterial`に渡している`uniform`変数は以下のようになります。

```ts:uniform変数
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
```

```ts:ShaderMaterial
const material = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms,
  vertexShader: VertexShader,
  fragmentShader: FragmentShader,
});
```

## テクスチャをブラウザの画面にフィットさせる

`Plane`をブラウザの画面サイズと同じ大きさにしたら、次はテクスチャをブラウザの画面にフィットさせます。テクスチャをブラウザの画面にフィットさせるには、ブラウザのアスペクト比とテクスチャのアスペクト比を計算して、その比率を元にテクスチャのUV座標を計算します。

頂点シェーダーは共通で、以下のようになっています。頂点シェーダーでは、`varying`を使って`uv`座標をフラグメントシェーダーに渡しています。

```glsl:vertexShader
varying vec2 vUv;
void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition =  viewMatrix * worldPosition;
  gl_Position = projectionMatrix * mvPosition;
}
```

### 幅・高さともに画面サイズにする

まずは幅も高さも画面にフィットさせる方法を紹介します。これはテクスチャ自体のアスペクト比に関係なく、そのままブラウザの画面にフィットする方法です。

CSSで`img`タグに`width:100%, height:100%`を指定したような挙動になります。

```glsl:fragmentShader
uniform sampler2D uTexture;
varying vec2 vUv;
void main() {
  vec4 color = texture2D(uTexture, vUv);
  gl_FragColor = color;
}
```

以下DEMOです。

https://playground.yend.dev/three-fit-texure/fit/

### テクスチャのアスペクト比を保ったまま幅を画面にフィットさせる

こちらはテクスチャのアスペクト比を保った状態で、幅のみを画面にフィットさせる方法です。CSSで`img`タグに`width:100,height:auto`を指定したような挙動になります。

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

以下DEMOです。

https://playground.yend.dev/three-fit-texure/fit-width/

### テクスチャのアスペクト比を保ったまま高さを画面にフィットさせる

こちらはテクスチャのアスペクト比を保った状態で、高さのみを画面にフィットさせる方法です。CSSで`img`タグに`width:auto,height:100%`を指定したような挙動になります。

```glsl:fragmentShader

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

以下DEMOです。

https://playground.yend.dev/three-fit-texure/fit-height/

### `object-fit:cover`のような挙動にする

こちらはCSSで`img`タグに`object-fit:cover`を指定したような挙動です。

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

以下DEMOです。

https://playground.yend.dev/three-fit-texure/cover/

### `object-fit:contain`のような挙動にする

こちらはCSSで`img`タグに`object-fit:contain`を指定したような挙動です。

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

以下DEMOです。

https://playground.yend.dev/three-fit-texure/contain/

### `object-fit:contain`の挙動をしつつ、リピートする

こちらは`object-fit:contain`を指定した状態で空いたスペースにテクスチャをリピートさせる方法です。

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

以下DEMOです。

https://playground.yend.dev/three-fit-texure/contain-repeat/

## おわりに

`ShaderMaterial`を使ってテクスチャをブラウザの画面にフィットさせる方法を紹介しました。それほど難しいものではないですが、地味に忘れがちなので自分への備忘録も兼ねて記事にしました。改めて思考が整理されてよかったです。

## 参考
https://threejs.org/docs/#api/en/cameras/OrthographicCamera
https://zenn.dev/bokoko33/articles/bd6744879af0d5