import { GL, Scene, DrawAxis, DrawCopy, DrawBall } from "@experiments2/alfrid";
import Config from "./Config";
import {
  TargetSizeStrategy,
  FullscreenStrategy,
} from "./strategies/RenderStrategy";

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

  _init() {}

  _initTextures() {}

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
  }

  resize() {
    this.renderStrategy?.resize(this.camera);
  }
}
