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

// import "./test01";

import { GL } from "alfrid";
import Scene from "./SceneApp";
import Settings from "./Settings";
import { logError } from "./utils";
import preload from "./utils/preload";
import "./utils/Capture";
import Config from "./Config";
const debug = true;

let scene;
let canvas;
console.log("hash", fxhash);

if (debug) {
  import("./debug");
}

function _init3D() {
  if (process.env.NODE_ENV === "development") {
    Settings.init();
  }
  canvas = document.createElement("canvas");
  canvas.id = "main-canvas";
  document.body.appendChild(canvas);

  GL.init(canvas, { alpha: false, preserveDrawingBuffer: true });
  if (`drawingBufferColorSpace` in GL.gl) {
    GL.gl.drawingBufferColorSpace = "display-p3";
  }

  scene = new Scene();
  if (debug) {
    import("./utils/addControl").then(({ default: addControls }) => {
      addControls(scene);
    });
  }

  if (Config.audio) {
    import("./AudioManager");
  }
}

preload().then(_init3D, logError);
