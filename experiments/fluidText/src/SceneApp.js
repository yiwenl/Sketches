import {
  GL,
  Draw,
  Geom,
  ShaderLibs,
  DrawBall,
  DrawAxis,
  DrawCopy,
  Scene,
  FboPingPong,
} from "alfrid";
import { saveImage, getDateString } from "./utils";
import Config from "./Config";
import Scheduler from "scheduling";

// fluid simulation
import FluidSimulation from "./fluid-sim";

// fluid noise
import generateFluidNoise from "./generateFluidNoise";
import generateFluidDensity from "./generateFluidDensity";
import generateTextTexture from "./generateTextTexture";

import DrawBlocks from "./DrawBlocks";

import fs from "shaders/map.frag";
import { mat4 } from "gl-matrix";

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();

    // fluid
    const DISSIPATION = 0.985;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });
    this.orbitalControl.radius.setTo(8);
    // this.orbitalControl.rx.setTo(0.4);
    this.mtxModel = mat4.create();
    // mat4.translate(this.mtxModel, this.mtxModel, [0, 0.5, 0]);

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _initTextures() {
    this.resize();

    this._textureNoise = generateFluidNoise();
    this._textureDensity = generateFluidDensity();
    this._textureText = generateTextTexture();

    const fboSize = 2048;
    this._fboMap = new FboPingPong(fboSize, fboSize, { type: GL.FLOAT });
    this._fboMap.read.bind();
    GL.clear(0, 0, 0, 1);
    this._fboMap.read.unbind();
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();

    this._drawBlocks = new DrawBlocks();
    this._drawUpdate = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 1);
  }

  update() {
    // update fluid
    this._fluid.updateFlowWithMap(this._textureNoise, this._textureDensity, 1);
    this._fluid.update();

    // update map
    this._drawUpdate
      .bindFrameBuffer(this._fboMap.write)
      .bindTexture("uMap", this._fboMap.read.texture, 0)
      .bindTexture("uFluidMap", this._fluid.density, 1)
      .draw();

    this._fboMap.swap();
  }

  render() {
    let g = 0.1;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);
    GL.setModelMatrix(this.mtxModel);

    this._drawBlocks
      .uniform("uTime", Scheduler.getElapsedTime())
      .bindTexture("uMap", this._fboMap.read.texture, 0)
      .bindTexture("uCharMap", this._textureText, 1)
      .draw();

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    const pixelRatio = 2;
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera.setAspectRatio(GL.aspectRatio);
  }
}

export default SceneApp;
