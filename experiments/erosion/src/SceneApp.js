import {
  GL,
  DrawBall,
  DrawCopy,
  Scene,
  FrameBuffer,
  FboPingPong,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { random } from "./utils";
import Config from "./Config";

import generateHeightMap from "./generateHeightMap";
import Scheduler from "scheduling";

import DrawTerrain from "./DrawTerrain";
import DrawSave from "./DrawSave";
import DrawSim from "./DrawSim";
import DrawDrops from "./DrawDrops";
import DrawCopyDrops from "./DrawCopyDrops";
import DrawErosion from "./DrawErosion";

let oSettings;

class SceneApp extends Scene {
  constructor() {
    super();

    this.orbitalControl.rx.value = this.orbitalControl.ry.value = -0.5;
    this.orbitalControl.radius.value = 5;

    this._fboHeight.read.bind();
    GL.clear(0, 0, 0, 0);
    this._dCopy.draw(this._textureHeight);
    this._fboHeight.read.unbind();
    this.step();

    let count = 1;
    const interval = setInterval(() => {
      if (count-- > 0) this.step();
      else {
        clearInterval(interval);
        console.log("done");
      }
    }, 1000);
  }

  _init() {
    console.log("init");

    GL.setSize(targetWidth, targetHeight);
    this.camera.setAspectRatio(GL.aspectRatio);
    resize(GL.canvas, targetWidth, targetHeight);

    window.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        this.step();
      }
    });

    // texture settings
    oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };
  }

  _initTextures() {
    this._textureHeight = generateHeightMap();

    const { numDrops: num } = Config;

    this._fboDrops = new FboPingPong(num, num, oSettings, 3);
    this._fboHeight = new FboPingPong(
      this._textureHeight.width,
      this._textureHeight.height,
      oSettings
    );
    this._fboDropsAry = [];

    // debug texture
  }

  _initViews() {
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();

    this._drawTerrain = new DrawTerrain();
    this._drawDrops = new DrawDrops();
    this._drawCoyDrops = new DrawCopyDrops();
    this._drawSim = new DrawSim();
    this._drawErosion = new DrawErosion();

    new DrawSave()
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(this._fboDrops.read)
      .bindTexture("uHeightMap", this._textureHeight, 0)
      .draw();
  }

  step() {
    GL.disable(GL.DEPTH_TEST);

    this._drawSim
      .bindFrameBuffer(this._fboDrops.write)
      .bindTexture("uPosMap", this._fboDrops.read.getTexture(0), 0)
      .bindTexture("uDataMap", this._fboDrops.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fboDrops.read.getTexture(2), 2)
      .bindTexture("uHeightMap", this._fboHeight.read.texture, 3)
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();

    this._fboDrops.swap();
    GL.enable(GL.DEPTH_TEST);

    // const { width, height } = this._fboDrops.read;
    // const fbo = new FrameBuffer(width, height, oSettings, 2);
    // this._drawCoyDrops
    //   .bindFrameBuffer(fbo)
    //   .bindTexture("uPosMap", this._fboDrops.read.getTexture(0), 0)
    //   .bindTexture("uDataMap", this._fboDrops.read.getTexture(1), 1)
    //   .draw();
    // this._fboDropsAry.push(fbo);
    // if (this._fboDropsAry.length > 50) this._fboDropsAry.shift();

    // update height map with erosion
    const { numDrops } = Config;
    this._drawErosion
      .bindFrameBuffer(this._fboHeight.write)
      .bindTexture("uHeightMap", this._fboHeight.read.texture, 0)
      .bindTexture("uPosMap", this._fboDrops.read.getTexture(0), 1)
      .bindTexture("uDataMap", this._fboDrops.read.getTexture(1), 2)
      .uniform("uNumDrops", parseInt(numDrops))
      .draw();

    this._fboHeight.swap();
  }

  update() {
    this.step();
  }

  render() {
    let g = 0.1;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);
    const { width, height } = this._fboHeight.read.texture;

    const s = 1.0;
    this._drawTerrain
      .bindTexture("uHeightMap", this._fboHeight.read.texture, 0)
      .uniform("uHeightScale", 20.0)
      .uniform("uTextureSize", [width * s, height * s])
      .draw();

    // this._fboDropsAry.forEach((fbo) => {
    //   this._drawDrops
    //     .bindTexture("uPosMap", fbo.getTexture(0), 0)
    //     .bindTexture("uDataMap", fbo.getTexture(1), 1)
    //     .uniform("uViewport", [GL.width, GL.height])
    //     .uniform("uTerrainSize", Config.terrainSize)
    //     .draw();
    // });

    this._drawDrops
      .bindTexture("uPosMap", this._fboDrops.read.getTexture(0), 0)
      .bindTexture("uDataMap", this._fboDrops.read.getTexture(1), 1)
      .uniform("uViewport", [GL.width, GL.height])
      .uniform("uTerrainSize", Config.terrainSize)
      .draw();

    g = 0.05;

    g = 400;
    GL.viewport(0, 0, g, g);
    this._dCopy.draw(this._textureHeight);
    GL.viewport(g, 0, g, g);
    this._dCopy.draw(this._fboDrops.read.getTexture(0));
    GL.viewport(g * 2, 0, g, g);
    this._dCopy.draw(this._fboDrops.read.getTexture(1));
  }

  resize() {}
}

export default SceneApp;
