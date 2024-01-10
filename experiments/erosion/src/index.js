// these are the variables you can use as inputs to your algorithms
// console.log(fxhash); // the 64 chars hex number fed to your algorithm
// console.log(fxrand()); // deterministic PRNG function, use it instead of Math.random()

// note about the fxrand() function
// when the "fxhash" is always the same, it will generate the same sequence of
// pseudo random numbers, always

//----------------------
// defining features
//----------------------
// You can define some token features by populating the $fxhashFeatures property
// of the window object.
// More about it in the guide, section features:
// [https://fxhash.xyz/articles/guide-mint-generative-token#features]
//
// window.$fxhashFeatures = {
//   "Background": "Black",
//   "Number of lines": 10,
//   "Inverted": true
// }

// import "./sketch01.js";

import "./hash.js";
import { GL } from "alfrid";
import Scene from "./SceneApp";
import { logError } from "./utils";
import preload from "./utils/preload";
import "./utils/Capture";

const isDev = process.env.NODE_ENV === "development";

let scene;
let canvas;

const initScene = () => {
  canvas = document.createElement("canvas");
  canvas.id = "main-canvas";
  document.body.appendChild(canvas);

  GL.init(canvas, { alpha: false, preserveDrawingBuffer: true });
  const { gl } = GL;
  if (`drawingBufferColorSpace` in gl) {
    gl.drawingBufferColorSpace = "display-p3";
    console.log("Drawing Buffer Color Space:", gl.drawingBufferColorSpace);
  }

  scene = new Scene();
};

function _init3D() {
  if (isDev) {
    import("./Settings").then(({ default: Settings }) => {
      Settings.init();
      initScene();

      import("./utils/addControl").then(({ default: addControls }) => {
        addControls(scene);
        import("./debug");
      });
    });
  } else {
    initScene();
  }
}

preload().then(_init3D, logError);
