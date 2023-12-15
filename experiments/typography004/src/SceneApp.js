import {
  GL,
  Draw,
  Geom,
  DrawBall,
  DrawAxis,
  DrawCopy,
  ShaderLibs,
  Scene,
  HitTestor,
  FrameBuffer,
  FboPingPong,
} from "alfrid";
import {
  random,
  toGlsl,
  saveImage,
  getDateString,
  getMonoColor,
} from "./utils";
import Config from "./Config";
import geneateTextMap from "./geneateTextMap";

import { vec2, vec3 } from "gl-matrix";

import Scheduler from "scheduling";

// fluid simulation
import FluidSimulation from "./fluid-sim";
import DrawBg from "./DrawBg";
import DrawGrid from "./DrawGrid";
import CharsLayer from "./CharsLayer";

import generatePaperTexture from "./generatePaperTexture";

import fsCompose from "shaders/compose.frag";

// debug

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

    this.orbitalControl.radius.setTo(10);
    // this.orbitalControl.lockZoom(true);

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _initTextures() {
    this.resize();
    this._textureTextMap = geneateTextMap();
    this._texturePaper = generatePaperTexture();

    this._fboRender = new FboPingPong(GL.width, GL.height);
    this._fboChars = new FrameBuffer(GL.width, GL.height);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();

    this._drawCompose = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fsCompose);

    const adjColor = (v) => (v * 0.8) / 255;
    const r = 0.05;
    const s = 14;
    const mesh = Geom.plane(s, s, 1);

    this._layers = [
      new CharsLayer([108, 185, 253].map(adjColor), [r * 2.5, 0], false),
      new CharsLayer([221, 14, 153].map(adjColor), [r, 0], false),
      new CharsLayer(getMonoColor(0.1), [0, 0], true),
    ];

    let minNum = 999;
    this._layers.forEach((layer) => {
      minNum = Math.min(minNum, layer.num);
    });
    console.log("minNum :", minNum);

    this._drawBg = new DrawBg();
    this._drawGrid = new DrawGrid(minNum);

    this._mouse = vec3.create();
    this._mouseOld = vec3.create();
    this._hitTestor = new HitTestor(mesh, this.camera);
    this._hitTestor.on("onHit", ({ hit }) => {
      vec3.copy(this._mouseOld, this._mouse);
      vec3.copy(this._mouse, hit);

      const dir = vec3.sub([0, 0, 0], this._mouse, this._mouseOld);
      if (vec3.length(dir) > 0) {
        vec3.normalize(dir, dir);
      }
      let x = this._mouse[0] / s + 0.5;
      let y = this._mouse[1] / s + 0.5;

      this._fluid.updateFlow([x, y], [dir[0], dir[1]], 8, 3, 1);
    });
  }

  update() {
    const strength = 1;
    const noise = 1;

    let num = 4;
    const time = Scheduler.getElapsedTime() * 0.5;

    const { sin, cos } = Math;

    for (let i = 0; i < num; i++) {
      const radius = 1;
      let x = (i + 0.5) / num;
      let y = sin((i / num) * 8.0 + time * 0.8) * 0.25 + 0.5;

      const dir = [1, 0];
      vec2.rotate(dir, dir, [0, 0], random(-1, 1) * 0.5);
      this._fluid.updateFlow([x, y], dir, strength, radius, noise);
    }

    for (let i = 0; i < num; i++) {
      const radius = random(1, 3);
      let x = i / num;
      let y = cos((i / num) * 6.0 + time * 1.2) * 0.25 + 0.5;

      const dir = [-1, 0];
      vec2.rotate(dir, dir, [0, 0], random(-1, 1) * 0.5);
      this._fluid.updateFlow([x, y], dir, strength, radius, noise);
    }

    num = 4;
    const { PI } = Math;

    for (let i = 0; i < num; i++) {
      const r = random(0.2, 0.3);
      const a = (i / num) * Math.PI * 2 + time;
      const pos = [r, 0];
      const dir = [1, 0];
      vec2.rotate(pos, pos, [0, 0], a);
      vec2.rotate(dir, dir, [0, 0], a + PI * 0.75);
      vec2.add(pos, pos, [0.5, 0.5]);

      const radius = random(1, 3) * 2;
      this._fluid.updateFlow(pos, dir, strength, radius, noise);
    }

    this._fluid.update();
  }

  render() {
    let g = 0.1;
    const bgColor = [192, 158, 121].map(toGlsl);
    GL.clear(...bgColor, 1);
    GL.setMatrices(this.camera);

    GL.disable(GL.DEPTH_TEST);

    this._fboRender.read.bind();
    GL.clear(0, 0, 0, 1);
    this._drawBg
      .uniform("uColor", bgColor)
      .uniform("uRatio", GL.aspectRatio)
      .bindTexture("uMap", this._texturePaper, 0)
      .draw();

    this._drawGrid
      .uniform(
        "uColor",
        bgColor.map((v) => v * 0.5)
      )
      .draw();
    this._fboRender.read.unbind();

    this._layers.forEach((layer) => {
      layer.render(this._fluid.density, this._textureTextMap);

      this._drawCompose
        .bindFrameBuffer(this._fboRender.write)
        .setClearColor(0, 0, 0, 0)
        .bindTexture("uMap", this._fboRender.read.texture, 0)
        .bindTexture("uCharMap", layer.texture, 1)
        .draw();

      this._fboRender.swap();
    });

    this._dCopy.draw(this._fboRender.read.texture);

    // this._dCopy.draw(this._layers[2].texture);
    g = 400;
    GL.viewport(0, 0, g, g);
    // this._dCopy.draw(this._texturePaper);

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
