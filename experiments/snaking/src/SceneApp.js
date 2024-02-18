import {
  GL,
  Geom,
  Draw,
  DrawBall,
  DrawAxis,
  DrawCopy,
  Scene,
  GLTexture,
  FrameBuffer,
  HitTestor,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { getMonoColor, random, randomInt, toGlsl } from "./utils";
import Config from "./Config";

import DrawGrid from "./DrawGrid";
import NoiseTexture from "./NoiseTexture.js";

import snakeFill from "./snakeFill.js";
import drawBlocks from "./drawGradientBlocks.js";

// fluid simulation
import FluidSimulation from "./fluid-sim";

import { vec2, vec3, mat4 } from "gl-matrix";
import vs from "shaders/basic.vert";
import fs from "shaders/copy.frag";

// color palette

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    this.orbitalControl.lock();
    this.orbitalControl.radius.setTo(10);
  }

  _init() {
    this.resize();
    GL.disable(GL.DEPTH_TEST);

    // fluid
    const DISSIPATION = 0.992;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    // hit testor
    this._hit = [999, 999, 999];
    this._preHit = [999, 999, 999];
    const planeSize = 14;
    const mesh = Geom.plane(planeSize, planeSize, 1);

    const hitTestor = new HitTestor(mesh, this.camera);
    hitTestor.on("onHit", (e) => {
      if (this._preHit[0] === 999) {
        vec3.copy(this._preHit, e.hit);
        vec3.copy(this._hit, e.hit);
      } else {
        vec3.copy(this._preHit, this._hit);
        vec3.copy(this._hit, e.hit);
      }

      const dir3 = vec3.sub(vec3.create(), this._hit, this._preHit);
      const dir = [dir3[0], dir3[1]];
      vec2.normalize(dir, dir);

      const pos = [this._hit[0], this._hit[1]].map(
        (v) => (v / (planeSize / 2)) * 0.5 + 0.5
      );
      this._fluid.updateFlow(pos, dir, 10, 1.5, 0.2);
    });

    const fboSize = 1024;
    this._fboFluid = new FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });

    this._drawFluid = new Draw()
      .setMesh(mesh)
      .useProgram(vs, fs)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(this._fboFluid);
  }

  _initTextures() {
    const numXBlocks = randomInt(5, 12);
    const numYBlocks = numXBlocks;
    const blockSize = 2048 / numXBlocks;
    const { trails } = snakeFill(numXBlocks, numYBlocks);
    const canvasBlocks = drawBlocks(
      trails,
      numXBlocks,
      numYBlocks,
      blockSize,
      random(0.05, 0.25)
    );

    this._textureMap = new GLTexture(canvasBlocks);
    this._noiseTexture = new NoiseTexture();
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();

    this._drawGrid = new DrawGrid();
  }

  update() {
    this._textureNoise = this._noiseTexture.update();

    this._fluid.update();

    this._drawFluid.bindTexture("uMap", this._fluid.density, 0).draw();
  }

  render() {
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    const mtx = mat4.create();
    g = 0.01;
    mat4.translate(mtx, mtx, [g, -g, 0]);
    // GL.setModelMatrix(mtx);
    // this._drawGrid
    //   .bindTexture("uMap", this._textureMap, 0)
    //   .bindTexture("uGradientMap", this._fboFluid.texture, 1)
    //   .bindTexture("uNoiseMap", this._textureNoise, 2)
    //   .uniform("uMargin", Config.frame)
    //   .uniform("uRatio", GL.aspectRatio)
    //   .uniform("uColor", getMonoColor(0.2))
    //   .draw();

    mat4.identity(mtx);
    GL.setModelMatrix(mtx);
    this._drawGrid
      .bindTexture("uMap", this._textureMap, 0)
      .bindTexture("uGradientMap", this._fboFluid.texture, 1)
      .bindTexture("uNoiseMap", this._textureNoise, 2)
      .uniform("uMargin", Config.frame)
      .uniform("uRatio", GL.aspectRatio)
      .uniform("uColor", Config.colorBlocks.map(toGlsl))
      .draw();

    // this._dBall.draw(this._hit, [g, g, g], [1, 1, 1]);
  }

  resize() {
    if (!GL.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1.5;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);
    }
  }
}

export default SceneApp;
