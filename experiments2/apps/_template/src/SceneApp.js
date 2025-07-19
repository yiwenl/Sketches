import { GL, Scene, DrawAxis, DrawCopy, DrawBall } from "@alfrid";
import Config from "./Config";
import {
  TargetSizeStrategy,
  FullscreenStrategy,
} from "./strategies/RenderStrategy";

import Assets from "./Assets";

export default class SceneApp extends Scene {
  constructor() {
    super();

    // const map = Assets.get()

    // Choose strategy based on configuration
    this.renderStrategy = Config.useTargetSize
      ? new TargetSizeStrategy()
      : new FullscreenStrategy();

    // Initialize with the chosen strategy
    this.renderStrategy.init(GL.canvas);
  }

  _init() {}

  _initTextures() {
    this._texture = Assets.get("test");
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
  }

  update() {}

  render() {
    GL.clear(...Config.background, 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();

    const g = 500;
    const ratio = this._texture.width / this._texture.height;
    const w = g * ratio;
    const h = g;

    GL.viewport(0, 0, w, h);
    this._dCopy.draw(this._texture, 0, 0, w, h);
  }

  resize() {
    this.renderStrategy?.resize(this.camera);
  }
}
