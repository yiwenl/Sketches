import { GL, Scene, DrawAxis, DrawCopy, DrawBall } from "@alfrid";
import { mat4 } from "gl-matrix";
import Config from "./Config";
import {
  TargetSizeStrategy,
  FullscreenStrategy,
} from "./strategies/RenderStrategy";

import DrawGrassHigh from "./DrawGrassHigh";
import DrawGrassLow from "./DrawGrassLow";

export default class SceneApp extends Scene {
  constructor() {
    super();

    // Choose strategy based on configuration
    this.renderStrategy = Config.useTargetSize
      ? new TargetSizeStrategy()
      : new FullscreenStrategy();

    // Initialize with the chosen strategy
    this.renderStrategy.init(GL.canvas);
  }

  _init() {
    this.orbitalControl.rx.value = -0.3;
    this.orbitalControl.ry.value = -0.3;
  }

  _initTextures() {
    // this._texture = Assets.get("test");
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();

    this._drawGrassHigh = new DrawGrassHigh();
    this._drawGrassLow = new DrawGrassLow();
  }

  update() {}

  render() {
    GL.clear(...Config.background, 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();
    GL.disable(GL.CULL_FACE);
    let r = 1;
    const mat = mat4.create();
    mat4.translate(mat, mat, [-r, 0, 0]);
    GL.setModelMatrix(mat);
    this._drawGrassHigh.draw();
    mat4.translate(mat, mat, [r * 2, 0, 0]);
    GL.setModelMatrix(mat);
    this._drawGrassLow.draw();
    GL.enable(GL.CULL_FACE);
  }

  resize() {
    this.renderStrategy?.resize(this.camera);
  }
}
