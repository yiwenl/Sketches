import { GL, DrawBall, DrawAxis, DrawCopy, Scene } from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { saveImage, getDateString } from "./utils";
import Config from "./Config";

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();
    GL.setSize(targetWidth, targetHeight);
    this.camera.setAspectRatio(GL.aspectRatio);
    resize(GL.canvas, targetWidth, targetHeight);

    // this.orbitalControl.lock();

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _initTextures() {}

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
  }

  update() {}

  render() {
    let g = 0.1;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {}
}

export default SceneApp;
