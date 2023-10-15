import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  Scene,
  FboPingPong,
  FrameBuffer,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { RAD, random, saveImage, getDateString, getMonoColor } from "./utils";
import Config from "./Config";
import Scheduler from "scheduling";

// draw calls
import DrawSim from "./DrawSim";
import DrawSave from "./DrawSave";
import DrawRender from "./DrawRender";
import DrawBelt from "./DrawBelt";

let hasSaved = false;
let canSave = false;

// flocking settings
const maxRadius = 4;
const radius = 0.8;
const separationThreshold = 0.4;
const numSeg = 12;

class SceneApp extends Scene {
  constructor() {
    super();
    GL.setSize(targetWidth, targetHeight);
    this.camera.setAspectRatio(GL.aspectRatio);
    resize(GL.canvas, targetWidth, targetHeight);

    this.camera.setPerspective(120 * RAD, GL.aspectRatio, 0.1, 100);

    // this.orbitalControl.lock();
    this.orbitalControl.radius.setTo(6);
    this.orbitalControl.rx.value = -0.4;
    this.seed = random(10);

    this._fbos.forEach((fbo) => {
      fbo.bind();
      GL.clear(0, 0, 0, 0);
      this._dCopy.draw(this._fbo.read.texture);
      fbo.unbind();
    });

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _initTextures() {
    const { numParticles: num } = Config;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };
    this._fbo = new FboPingPong(num, num, oSettings, 4);

    this._fbos = [];
    for (let i = 0; i <= numSeg * 2; i++) {
      const fbo = new FrameBuffer(num, num, oSettings);
      this._fbos.push(fbo);
    }
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();

    new DrawSave()
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(this._fbo.read)
      .draw();

    this._drawRender = new DrawRender();
    this._drawSim = new DrawSim();

    this._drawBelt = new DrawBelt();
  }

  update() {
    this.orbitalControl.ry.value += 0.02;
    const { numParticles: num } = Config;
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .uniform("uTime", Scheduler.getElapsedTime() + this.seed)
      .uniform("uNum", parseInt(num))
      .uniform("uRadius", radius)
      .uniform("uMaxRadius", maxRadius)
      .uniform("uSeparationThreshold", separationThreshold)
      .draw();

    this._fbo.swap();

    const fbo = this._fbos.shift();
    fbo.bind();
    GL.clear(0, 0, 0, 0);
    this._dCopy.draw(this._fbo.read.texture);
    fbo.unbind();
    this._fbos.push(fbo);
  }

  render() {
    let g = 0.05;
    GL.clear(...getMonoColor(g), 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();

    this._drawRender
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 1)
      .uniform("uViewport", [GL.width, GL.height]);
    // .draw();

    let startIndex = 0;
    this._drawBelt
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), this._fbos.length)
      .uniform("uColorMul", getMonoColor(1));

    for (let i = 0; i <= numSeg; i++) {
      const fbo = this._fbos[i + startIndex];
      this._drawBelt.bindTexture(`uPosMap${i}`, fbo.texture, i);
    }
    this._drawBelt.uniform("uScaleOffset", 0).draw();

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {}
}

export default SceneApp;
