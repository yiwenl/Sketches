import {
  GL,
  Scene,
  DrawAxis,
  DrawCopy,
  DrawBall,
  DrawCamera,
  CameraOrtho,
  Object3D,
  FrameBuffer,
} from "@alfrid";
import Config from "./Config";
import {
  TargetSizeStrategy,
  FullscreenStrategy,
} from "./strategies/RenderStrategy";

import DrawFloor from "./DrawFloor";
import DrawWall from "./DrawWall";

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

  _init() {
    this.orbitalControl.rx.value = -0.3;
    this.orbitalControl.ry.value = -0.7;

    this.container = new Object3D();

    this._initShadow();
  }

  _initShadow() {
    this._light = [2, 5, 2];
    const shadowMapSize = 2048;
    this._fboShadow = new FrameBuffer(shadowMapSize, shadowMapSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });
  }

  _initTextures() {}

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();
    this._dFloor = new DrawFloor();
    this._dWall = new DrawWall();

    this.container.addChild(this._dFloor.container);
    this.container.addChild(this._dWall.container);
    this.container.y = -1.5;
  }

  update() {
    GL.setModelMatrix(this.container.matrix);

    this.drawScene(false);
  }

  drawScene(mShadow) {}

  render() {
    let g;
    GL.clear(...Config.background, 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();
    this._dFloor.draw();
    this._dWall.draw();

    this.drawScene(true);
  }

  resize() {
    this.renderStrategy?.resize(this.camera);
  }
}
