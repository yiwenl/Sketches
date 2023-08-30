import { GL } from "alfrid";
import Scene from "./SceneApp";
import Settings from "./Settings";
import { logError } from "./utils";
import preload from "./utils/preload";
import "./utils/Capture";

import "./debug";
import addControls from "./utils/addControl";

let scene;
let canvas;
console.log("hash", fxhash);

function _init3D() {
  // if (process.env.NODE_ENV === "development") {
  //   Settings.init();
  // }
  canvas = document.createElement("canvas");
  canvas.id = "main-canvas";
  document.body.appendChild(canvas);

  GL.init(canvas, { alpha: false, preserveDrawingBuffer: true });

  scene = new Scene();
  // try {
  addControls(scene);
  // } catch (e) {}
}

preload().then(_init3D, logError);
