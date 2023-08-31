import { GL } from "alfrid";
import Scene from "./SceneApp";
import Settings from "./Settings";
import { logError } from "./utils";
import preload from "./utils/preload";
import "./utils/Capture";
import Config from "./Config";

import "./debug";
import addControls from "./utils/addControl";

let scene;
let canvas;

function _init3D() {
  if (GL.isMobile) {
    Config.numParticles = 128;
  }

  Settings.init();
  canvas = document.createElement("canvas");
  canvas.id = "main-canvas";
  document.body.appendChild(canvas);

  GL.init(canvas, { alpha: false, preserveDrawingBuffer: true });

  scene = new Scene();
  addControls(scene);
}

preload().then(_init3D, logError);
