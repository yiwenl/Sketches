import {
  GL,
  Scene,
  DrawAxis,
  DrawCopy,
  DrawBall,
  FboPingPong,
  FrameBuffer,
} from "@alfrid";
import Config from "./Config";
import {
  TargetSizeStrategy,
  FullscreenStrategy,
} from "./strategies/RenderStrategy";

import generateHeightMap from "./generateHeightMap";
import generateSplatMap from "./generateSplatMap";
import generateNormalMap from "./generateNormalMap";
import DrawMountain from "./DrawMountain";
import MapConstants from "./MapConstants";
import DrawSave from "./DrawSave";
import DrawDroplets from "./DrawDroplets";
import DrawSim from "./DrawSim";
import DrawErosion from "./DrawErosion";
import DrawApplyErosion from "./DrawApplyErosion";
import Scheduler from "scheduling";

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
    this.orbitalControl.rx.value = -0.8;
    this.orbitalControl.ry.value = -0.3;

    this._step = 0;
  }

  _initTextures() {
    this._heightMap = generateHeightMap();
    this._splatMap = generateSplatMap();

    const { numDroplets } = Config;
    const { TEXTURE_SIZE } = MapConstants;

    this._fboErosion = new FrameBuffer(TEXTURE_SIZE, TEXTURE_SIZE, {
      type: GL.FLOAT,
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });

    this._fboDroplets = new FboPingPong(
      numDroplets,
      numDroplets,
      {
        type: GL.FLOAT,
        minFilter: GL.NEAREST,
        magFilter: GL.NEAREST,
      },
      3
    );
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dMountain = new DrawMountain();
    this._dDroplets = new DrawDroplets();
    this._dSim = new DrawSim();
    this._dErosion = new DrawErosion();
    this._dApplyErosion = new DrawApplyErosion();

    new DrawSave().bindFrameBuffer(this._fboDroplets.read).draw();
  }

  update() {
    this.simulate();
    this._normalMap = generateNormalMap(this._heightMap.read.texture);
    this._step++;
  }

  simulate() {
    this._dSim
      .bindFrameBuffer(this._fboDroplets.write)
      .bindTexture("uPosMap", this._fboDroplets.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fboDroplets.read.getTexture(1), 1)
      .bindTexture("uHeightMap", this._heightMap.read.texture, 2)
      .uniform("uTimeStep", Scheduler.getDeltaTime() * 0.001)
      .uniform("uMinSlope", 0.001)
      .draw();

    this._fboDroplets.swap();

    if (this._step < Config.numStepsSimulation) {
      // update erosion map
      GL.enableAdditiveBlending();
      GL.disable(GL.DEPTH_TEST);
      this._dErosion
        .bindFrameBuffer(this._fboErosion)
        .bindTexture("uDropletsMap", this._fboDroplets.read.getTexture(0), 0)
        .bindTexture("uSedimentMap", this._fboDroplets.read.getTexture(1), 1)
        .bindTexture("uSplatMap", this._splatMap, 2)
        .draw();

      GL.enableAlphaBlending();
      GL.enable(GL.DEPTH_TEST);

      this._dApplyErosion
        .bindFrameBuffer(this._heightMap.write)
        .bindTexture("uHeightMap", this._heightMap.read.texture, 0)
        .bindTexture("uErosionMap", this._fboErosion.texture, 1)
        .draw();

      this._heightMap.swap();
    }
  }

  render() {
    let g;
    GL.clear(...Config.background, 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();

    g = MapConstants.MAP_SIZE;
    const s = 0.01;
    this._dBall.draw([g, 0, g], [s, s, s], [1, 0, 0]);
    this._dBall.draw([-g, 0, g], [s, s, s], [1, 0, 0]);
    this._dBall.draw([g, 0, -g], [s, s, s], [1, 0, 0]);
    this._dBall.draw([-g, 0, -g], [s, s, s], [1, 0, 0]);

    this._dMountain
      .uniform("uMaxHeight", MapConstants.MAX_HEIGHT)
      .bindTexture("uHeightMap", this._heightMap.read.texture, 0)
      .bindTexture("uErosionMap", this._fboErosion.texture, 1)
      .bindTexture("uNormalMap", this._normalMap, 2)
      .draw();

    if (Config.showDroplets) {
      this._dDroplets
        .bindTexture("uPosMap", this._fboDroplets.read.getTexture(0), 0)
        .bindTexture("uHeightMap", this._heightMap.read.texture, 1)
        .bindTexture("uDebugMap", this._fboDroplets.read.getTexture(2), 2)
        .uniform("uViewport", [GL.width, GL.height])
        .draw();
    }

    g = 512;
    GL.viewport(0, 0, g, g);
    // this._dCopy.draw(this._heightMap.read.texture);

    // GL.viewport(g, 0, g, g);
    // this._dCopy.draw(this._fboDroplets.read.getTexture(0));
    // GL.viewport(g * 2, 0, g, g);
    // this._dCopy.draw(this._fboDroplets.read.getTexture(1));
    // GL.viewport(g * 3, 0, g, g);
    // this._dCopy.draw(this._splatMap);
    // GL.viewport(g * 4, 0, g, g);
    // this._dCopy.draw(this._fboErosion.texture);
  }

  resize() {
    this.renderStrategy?.resize(this.camera);
  }
}
