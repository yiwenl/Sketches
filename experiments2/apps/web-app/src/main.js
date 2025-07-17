import { GL } from "@alfrid";
import { addCapture } from "@utils";

import Assets from "./Assets";
import Settings from "./Settings";
import SceneApp from "./SceneApp";

const isDev = process.env.NODE_ENV === "development";
const keepGui = isDev;

const pixelRatio = 2;

Settings.init();

Assets.load().then(init);

function init() {
  const canvas = document.createElement("canvas");
  canvas.id = "main-canvas";
  document.body.appendChild(canvas);

  GL.init(canvas, { alpha: false, preserveDrawingBuffer: true });
  GL.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
  new SceneApp();

  initGui();
  addCapture();
}

function initGui() {
  if (keepGui) {
    import("./development/init-gui");
  }
  if (isDev) {
    import("./development/stats");
  }
}
