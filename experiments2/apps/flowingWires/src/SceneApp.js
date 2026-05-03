import {
  GL,
  Scene,
  DrawAxis,
  DrawCopy,
  DrawBall,
  FrameBuffer,
  FboPingPong,
} from "@alfrid";
import Config from "./Config";
import {
  TargetSizeStrategy,
  FullscreenStrategy,
} from "./strategies/RenderStrategy";

import DrawSave from "./DrawSave";
import DrawDots from "./DrawDots";
import DrawSim from "./DrawSim";

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
    const { numParticles: num } = Config;

    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };

    this._fbo = new FboPingPong(num, num, oSettings, 4);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dDots = new DrawDots();
    this._dSim = new DrawSim();
    new DrawSave()
      .bindFrameBuffer(this._fbo.read)
      .setClearColor(0, 0, 0, 0)
      .draw();
  }

  update() {
    this._dSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .draw();

    this._fbo.swap();
  }

  render() {
    let g;
    GL.clear(...Config.background, 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();

    this._dDots
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .uniform("uViewport", [GL.canvas.width, GL.canvas.height])
      .draw();

    g = 512;
    GL.viewport(0, 0, g, g);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    GL.viewport(g, 0, g, g);
    this._dCopy.draw(this._fbo.read.getTexture(2));
    GL.viewport(g * 2, 0, g, g);
    this._dCopy.draw(this._fbo.read.getTexture(3));
  }

  resize() {
    this.renderStrategy?.resize(this.camera);
  }
}
