import { GL, Scene, DrawAxis, DrawCopy, DrawBall } from "@experiments2/alfrid";
import Config from "./Config";
import { targetWidth, targetHeight, pixelRatio } from "./features";
import { resize } from "@experiments2/utils";

export default class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight, Config.margin);
    }
  }

  _init() {
    this.resize();
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
    GL.clear(...Config.background, 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();
  }

  resize() {
    if (!Config.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);
    }
  }
}
