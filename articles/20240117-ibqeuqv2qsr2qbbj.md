---
title: "【Three.js】ShaderMaterialを使って画像を画面にフィットさせる"
emoji: "📌"
type: "tech" # tech: 技術記事 / idea: アイデア
topics: ["threejs", "glsl", "shader"]
published: false
---

Three.jsの`ShaderMaterial`を用いて画像をブラウザの画面にフィットさせる方法を紹介します。本記事では開発環境として[Vite](https://ja.vitejs.dev/)を使用してますが、基本的な部分は他の環境でも活かせると思います。

## 全体のコード

まず前提として`Shader`以外の全体のコードを紹介します。後ほど重要な箇所は説明をするので、ざっくりと確認してもらうだけで問題ありません。`Plane`メッシュを1つ置いて、その`Plane`に`ShaderMaterial`でテクスチャを貼り付けています。

```html:HTML
<canvas id="canvas"></canvas>
```

```html:HTML
<script id="vertexShader" type="x-shader/x-vertex">
  //...頂点シェーダーのコード
</script>
<script id="fragmentShader" type="x-shader/x-fragment">
  //...頂点シェーダーのコード
</script>
```

HTML側に`canvas`と`script`タグが存在することを想定しています。`script`タグは後述するシェーダーのコードを記述するためのものです。

```ts:TypeScript
import * as THREE from 'three';
import Texture from '../../assets/img/texture.png';

// canvas要素を取得
const canvas = document.querySelector<HTMLCanvasElement>('#canvas');
if (!canvas) {
  throw new Error('canvas not found');
}

const getWindowSize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const aspect = width / height;
  return {
    width,
    height,
    aspect,
  };
};
const getShader = (id: string) => {
  const script = document.querySelector<HTMLScriptElement>(`#${id}`);
  if (!script) {
    throw new Error(`script not found: ${id}`);
  }
  return script.innerText;
};

// シェーダーのコードを取得
const FragmentShader = getShader('fragmentShader');
const VertexShader = getShader('vertexShader');

const app = (texture: THREE.Texture) => {
  const windowSize = getWindowSize();

  // レンダラーを作成
  const renderer = new THREE.WebGLRenderer({
    canvas,
  });
  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(windowSize.width, windowSize.height);

  // シーンを作成
  const scene = new THREE.Scene();

  // カメラを作成
  // PerspectiveCameraではなくOrthographicCameraを使用
  const camera = new THREE.OrthographicCamera(
    windowSize.width / -2,
    windowSize.width / 2,
    windowSize.height / 2,
    windowSize.height / -2,
    1,
    10
  );
  camera.position.z = 5;
  scene.add(camera);

  // テクスチャーから画像のサイズを取得
  const textureImg = texture.image as HTMLImageElement;
  const textureWidth = textureImg.width;
  const textureHeight = textureImg.height;

  // shaderに渡すuniform変数を定義　
  const uniforms = {
    uTexture: {
      value: texture,
    },
    uTextureAspect: {
      value: textureWidth / textureHeight,
    },
    uScreenAspect: {
      value: windowSize.aspect,
    },
  };

  // PlaneGeometryとShaderMaterialからメッシュを作成
  const geometry = new THREE.PlaneGeometry(windowSize.width, windowSize.height);
  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms,
    vertexShader: VertexShader,
    fragmentShader: FragmentShader,
  });
  const plane = new THREE.Mesh(geometry, material);
  scene.add(plane);

  // requestAnimationFrameで描画
  const tick = () => {
    requestAnimationFrame(tick);
    renderer.render(scene, camera);
  };
  tick();

  // リサイズ時の処理
  const onResize = () => {
    const windowSize = getWindowSize();

    // PlaneGeometryのサイズを更新
    plane.geometry = new THREE.PlaneGeometry(
      windowSize.width,
      windowSize.height
    );

    // 画面のアスペクト比を更新
    material.uniforms.uScreenAspect.value = windowSize.aspect;

    // カメラを更新
    camera.left = windowSize.width / -2;
    camera.right = windowSize.width / 2;
    camera.top = windowSize.height / 2;
    camera.bottom = windowSize.height / -2;
    camera.updateProjectionMatrix();

    // レンダラーを更新
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(windowSize.width, windowSize.height);
  };
  window.addEventListener('resize', onResize);
};

const init = async () => {
  const texture = await new THREE.TextureLoader().loadAsync(Texture);
  app(texture);
};
init();
```

## Planeをブラウザの画面サイズと同じ大きさにする

## 画像をブラウザの画面にフィットさせる

### 縦も横も画面にフィットさせる

https://playground.yend.dev/three-fit-texure/fit/

### 縦横比を保ったまま横幅を画面にフィットさせる

https://playground.yend.dev/three-fit-texure/fit-width/

### 縦横比を保ったまま縦幅を画面にフィットさせる

https://playground.yend.dev/three-fit-texure/fit-height/

### `object-fit:cover`のような挙動にする

https://playground.yend.dev/three-fit-texure/cover/

### `object-fit:contain`のような挙動にする

https://playground.yend.dev/three-fit-texure/contain/


## 参考
https://threejs.org/docs/#api/en/cameras/OrthographicCamera
https://zenn.dev/bokoko33/articles/bd6744879af0d5