---
title: "Reactã§requestAnimationFrameãæ±ã"
emoji: "ð¬"
type: "tech" # tech: æè¡è¨äº / idea: ã¢ã¤ãã¢
topics: ["JavaScript", "React"]
published: true
---

# æ¦è¦

ã¢ãã¡ã¼ã·ã§ã³ã§ããä½¿ç¨ããã`requestAnimationFrame`ã
éå¸¸ã«ä¾¿å©ã§ä½¿ããããã¡ã½ãããªã®ã§ãããReactã§æ±ãã«ã¯å°ãçããã£ãã®ã§ãä»åã¯ãã®ãã¨ã«ã¤ãã¦æ¸ãã¦ãããã¨æãã¾ãã

# å®æå½¢

ã¾ãã¯ä»åè§£èª¬ããã³ã¼ãã®å®æå½¢ã

@[codepen](https://codepen.io/yend24/pen/ZEJmVZr)

STARTãã¿ã³ãæ¼ãã¨ã«ã¦ã³ãã®å®è¡ãSTOPãã¿ã³ãæ¼ãã¨ã«ã¦ã³ãã®åæ­¢ãã§ãã¾ãã
ã·ã³ãã«ãªã«ã¦ã³ã¿ã¼ã§ããããã®å®è£ãå®æã¨ãã¦ãããã¾ã§ã®éç¨ãèãã¦ããã¾ãã

# requestAnimationFrame

ã¾ã`requestAnimationFrame`ã§ã«ã¼ãããç°¡åãªä½¿ãæ¹ãç´¹ä»ãã¾ãã

```js
const loop = () => {
  // å¦ç
  requestAnimationFrame(step);
};
// ã«ã¼ãã®å®è¡
loop();
```

ããã¿ãå½¢ã§ãã­ãã³ã¼ã«ããã¯ã§åå¸°çã«é¢æ°ãå®è¡ãããã¨ã§ã«ã¼ããå®ç¾ãã¦ãã¾ãã
ã«ã¼ããæ­¢ããããã«ã¯åå¸°å¼ã³åºããæ­¢ãããã`cancelAnimationFrame`ãä½¿ãã¾ãã

https://developer.mozilla.org/ja/docs/Web/API/Window/requestAnimationFrame
https://developer.mozilla.org/ja/docs/Web/API/Window/cancelAnimationFrame

**åå¸°å¼ã³åºããæ­¢ãããã¿ã¼ã³**

```js
let count = 0;
const loop = () => {
  // å¦ç
  if (count < 200) {
    // count ãã200ãããå°ããæã ã
    requestAnimationFrame(loop);
  }
  count++;
};
// ã«ã¼ãã®éå§
loop();
```

**`cancelAnimationFrame` ã®ä½¿ç¨**

```js
let reqid;
let count = 0;
const loop = () => {
  reqid = requestAnimationFrame(loop);
  // å¦ç
  if (count >= 200) {
    // count ãã200ãããå°ããæã ã
    cancelAnimationFrame(reqid);
  }
  count++;
};
// ã«ã¼ãã®éå§
loop();
```

# Reactã§requestAnimationFrameãä½¿ç¨ãã

é ãè¿½ã£ã¦å®è£ãã¾ãã

## ã·ã³ãã«ã«å®è£ãã¦ã¿ã

ã¾ãã¯ã·ã³ãã«ã«Reactã«åãè¾¼ãã§ã¿ã¾ãã

```jsx
const Component = () => {
  const loop = () => {
    // ã«ã¼ããããå¦ç
    requestAnimationFrame(loop);
  };
  React.useEffect(() => {
    loop();
  }, [loop]);

  //...ç¥
};
```

ä¸è¦è¯ãããã«è¦ãã¾ãããã³ã³ãã¼ãã³ããç ´æ£ãããã¨ãã«ã«ã¼ããæ­¢ããå¿è¦ãããã¾ãã­ã
ãããã£ã¦ã`useEffect`ã®ã¯ãªã¼ã³ã¢ããé¢æ°ã¨ãã¦`cancelAnimationFrame`ãä½¿ãã¾ãã

ãããã`cancelAnimationFrame`ãä½¿ãããã«ã¯`requestAnimationFrame`ããè¿ããã`requestID`ãå¿è¦ã§ãã`requestID`ãä¿æããããã«`useRef`ãä½¿ç¨ãã¾ãããã

```jsx
const Component = () => {
  const reqIdRef = React.useRef();
  const loop = () => {
    // ã«ã¼ããããå¦ç
    reqIdRef.current = requestAnimationFrame(loop);
  };
  React.useEffect(() => {
    loop();
    return () => cancelAnimationFrame(reqIdRef.current);
  }, []);

  //...ç¥
};
```

å®ç§ã§ãã­ã

## åæç»ãèãã

ã§ã¯ãæ¬¡ã«ãã¬ã¼ã ã«ã¦ã³ã¿ã¼ãå®è£ãã¦ã¿ã¾ãããã

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

å®éã«ä¸è¨ãå®è£ãã¦ã¿ãã¨`counter`ãæ´æ°ããã¾ããã
çç±ã¨ãã¦ã¯åç´ã§`useRef`ã¯åæç»ãããªã¬ã¼ããã§ãã
è§£æ±ºç­ã¨ãã¦ã`useState`ãä½¿ãã¾ãã

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

ãã¬ã¼ã ã«ã¦ã³ã¿ã¼ãå®è£ã§ãã¾ããã

## Hooksã«åãåºãã¦ã¿ã

ãã®ã¾ã¾ã§ã¯å°ãç©ãããã®ã§Hooksã«åãåºãã¦ã¿ã¾ãã

```jsx
// ã«ã¼ãã§å®è¡ãããå¦ç ã callbacké¢æ°ã«æ¸¡ã
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

ã ãã¶ã¹ãã­ãªãã¾ããã­ãæ©è½ã¨ãã¦ã¯ããã§å®æã§ãã

## ããã©ã¼ãã³ã¹ãèãã¦ã¿ã

ãªãã¡ã¯ã¿ãªã³ã°ã¨ã¾ã§ã¯è¨ããªãã§ãããããã©ã¼ãã³ã¹ã®ç¹ã§æ°ã«ãªãã¨ãããããã®ã§æ¸ãæãã¦ã¿ã¾ãã

```jsx
// ã«ã¼ãã§å®è¡ãããå¦ç ã callbacké¢æ°ã«æ¸¡ã
const useAnimationFrame = (callback = () => {}) => {
  const reqIdRef = React.useRef();
  // useCallback ã§ callback é¢æ°ãæ´æ°ãããæã®ã¿é¢æ°ãåçæ
  const loop = React.useCallback(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    callback();
  }, [callback]);

  React.useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqIdRef.current);
    // loop ãä¾å­éåã«
  }, [loop]);
};
```

å¨ä½ã¨ãã¦ã¯ãããªãã¾ãã

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

  // setCounter ãããã³ã«é¢æ°ãåçæããã®ãé²ã
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

è¥å¹²åé·ã«è¦ãã¾ãããä¸è¨ã§ã ããªé¢æ°ã®åçæãé²ããããã«ãªãã¾ããã

## STARTã¨STOPãã¿ã³ãä½ã

ããã§ã¯å®æå½¢ã®ããã«STARTã¨STOPãã¿ã³ãå®è£ãã¾ãã

```jsx
// ç¬¬ä¸å¼æ°ã« boolean ãã¨ãããã«ä¿®æ­£
// - true ãªãã«ã¼ã
// - false ãªãåæ­¢
const useAnimationFrame = (isRunning, callback = () => {}) => {
  const reqIdRef = React.useRef();
  const loop = React.useCallback(() => {
    if (isRunning) {
      // isRunning ã true ã®æã ãã«ã¼ã
      reqIdRef.current = requestAnimationFrame(loop);
      callback();
    }
    // isRunning ãä¾å­éåã«è¿½å 
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

å¼æ°ã« `isRunning` ãã¨ãããã«hooksãå¤æ´ããtrueãªãã«ã¼ãå®è¡ãfalseãªãã«ã¼ãåæ­¢ãå®è£ãã¾ããã
ããã§æåã«è¼ããã³ã¼ãã®å®æã¨ãªãã¾ãï¼

# å°ãå¿ç¨

@[codepen](https://codepen.io/yend24/pen/QWMYqvp)

ãã ã«ã¦ã³ãã¢ããããã ãã§ã¯ã¤ã¾ããªãã®ã§ãä¸ä¾ã¨ãã¦æ°å­ã«ã¼ã¬ããã¢ãã¡ã¼ã·ã§ã³ãå®è£ãã¦ã¿ã¾ããã
å°ãå¿ç¨ããã ãã§æ°å­ã«ã¼ã¬ããã¢ãã¡ã¼ã·ã§ã³ãç°¡åã«å®è£ã§ãã¾ãã®ã§ãä½¿ã£ã¦ã¿ããæ¹ã¯åèã«ãã¦ã¿ã¦ãã ããã

# ã¾ã¨ã

Reactã«ããã¦`requestAnimationFrame`ãæ±ãæ¹æ³ã§ããã
ãã®æ§è³ªä¸ãããã©ã¼ãã³ã¹ãèããã¨ã ãã¶çãããããã«æãã¾ããã
è«¸ãæ¤è¨ããä¸ã§ãåé¡ãçºçããªãããã«ä½¿ç¨ã§ããã¨è¯ãã§ãã­ã

# åè

https://css-tricks.com/using-requestanimationframe-with-react-hooks/
https://bom-shibuya.hatenablog.com/entry/2020/10/27/182226
