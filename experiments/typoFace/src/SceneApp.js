import {
  GL,
  Draw,
  Geom,
  Scene,
  DrawCopy,
  EaseNumber,
  ShaderLibs,
  FrameBuffer,
  FboPingPong,
} from "alfrid";
import {
  random,
  toGlsl,
  getMonoColor,
  saveImage,
  getDateString,
} from "./utils";
import Config from "./Config";
import Scheduler from "scheduling";

// draw calls
import DrawFace from "./DrawFace";

// layer
import Layer from "./Layer";

// textures
import generateTextMap from "./generateTextMap";
import generatePaperTexture from "./generatePaperTexture";
import generateNoiseMap from "./generateNoiseMap";

// fluid simulation
import FluidSimulation from "./fluid-sim";

import FaceDetection, {
  videoWidth,
  videoHeight,
  FACE_DETECTED,
  FACE_LOST,
  VIDEO_STARTED,
} from "./FaceDetection";

import { vec2 } from "gl-matrix";

// shaders
import fsLayer from "shaders/layer.frag";
import fsCompose from "shaders/compose.frag";
import fsCutoff from "shaders/cut.frag";

let hasSaved = false;
let canSave = false;

const faceMeshScale = 0.05;

class SceneApp extends Scene {
  constructor() {
    super();

    // this.orbitalControl.lock();

    // fluid
    const DISSIPATION = 0.98;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    // face detection
    this._hasFaceDetected = false;
    FaceDetection.on(FACE_DETECTED, this.onFaceDetected);
    FaceDetection.on(VIDEO_STARTED, this.onVideoStarted);
    FaceDetection.init();

    this._faceCutoff = new EaseNumber(0);
    FaceDetection.on(FACE_LOST, () => {
      this._faceCutoff.value = 0;
    });

    this._initWebSocket();

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _initWebSocket() {
    const serverUrl = "ws://localhost:8888";
    const ws = new WebSocket(serverUrl);

    ws.onopen = () => {
      console.log("Connected to the server");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onmessage = (event) => {
      console.log("on messave", event);
      if (event.data.indexOf("takeScreenShot") > -1) {
        const fileName = event.data.split("takeScreenShot: ")[1];
        console.log("fileName", fileName);

        if (fileName !== "") {
          saveImage(GL.canvas, `tie-${fileName}-${getDateString()}`);
        }
      }
    };
  }

  // face detection
  onFaceDetected = (mFace) => {
    this._faceCutoff.value = 1;
    this._hasFaceDetected = true;
    const { keypoints } = mFace;

    const getAdjustedPoint = (p) => {
      return [p.x - videoWidth / 2, -(p.y - videoHeight / 2), -p.z].map(
        (v) => v * faceMeshScale
      );
    };

    const getAdjustedPointByIndex = (index) => {
      return getAdjustedPoint(keypoints[index]);
    };

    const vertices = keypoints.map(getAdjustedPoint);
    this._drawFace.update(vertices);
  };

  onVideoStarted = () => {};

  _initTextures() {
    this.resize();

    this._fboFace = new FrameBuffer(GL.width, GL.height);
    this._textureChars = generateTextMap();
    this._texturePaper = generatePaperTexture();
    this._textureNoise = generateNoiseMap();

    this._fboRender = new FboPingPong(GL.width, GL.height);
    this._fboFluid = new FrameBuffer(GL.width, GL.height);
    this._fboChar = new FrameBuffer(GL.width, GL.height);
  }

  _initViews() {
    this._dCopy = new DrawCopy();

    // face
    this._drawFace = new DrawFace().setClearColor(0, 0, 0, 1);

    // layer
    this._drawLayer = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fsLayer)
      .setClearColor(0, 0, 0, 1);

    // compose
    this._drawCompose = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fsCompose)
      .setClearColor(0, 0, 0, 1);

    this._drawCutoff = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fsCutoff)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(this._fboFluid);

    // layers
    const adjColor = (v) => (v * 0.8) / 255;
    const r = 0.05;

    this._layers = [
      new Layer([108, 185, 253].map(adjColor), [r * 2.5, 0], 1),
      new Layer([221, 14, 153].map(adjColor), [r, 0], 1),
      new Layer(getMonoColor(0.1), [0, 0], 2, true),
    ];

    this._layersFluid = [
      new Layer([108, 185, 253].map(adjColor), [r * 2.5, 0], 2),
      new Layer([221, 14, 153].map(adjColor), [r, 0], 2),
      new Layer(getMonoColor(0.1), [0, 0], 4, true),
    ];
  }

  update() {
    this._drawFace.bindFrameBuffer(this._fboFace).draw();
    if (!this._hasFaceDetected) {
      return;
    }

    // this.updateFluidMap();
    this.updateFluid();
    // this.updateFluid1();

    this._drawCutoff
      .bindTexture("uMap", this._fluid.density, 0)
      .bindTexture("uFaceMap", this._fboFace.texture, 1)
      .uniform("uRatio", GL.aspectRatio)
      .uniform("uCutoff", this._faceCutoff.value)
      .draw();
  }

  updateFluidMap() {
    if (random() < 0.25) {
      this._textureNoise = generateNoiseMap();
    }

    this._fluid.updateFlowWithMap(this._textureNoise, this._textureNoise, 0.5);
    this._fluid.update();
  }

  updateFluid1() {
    let num = 3;
    const strength = 1;
    const noise = 1;
    const time = Scheduler.getElapsedTime() * 0.5;
    for (let i = 0; i < num; i++) {
      let x = (i / num + random(-1, 1) * 0.1 + time) % 1;

      let y = random(0.6, 0.2);
      const dir = [random(-1, 1) * 0.1, 3];
      const radius = random(1, 3);
      // vec2.normalize(dir, dir);
      // this._fluid.updateFlow([x, y], dir, strength * 2, radius, noise);
    }

    num = 2;
    for (let i = 0; i < num; i++) {
      let x = (i / num + random(-1, 1) * 0.1 + time) % 1;
      let y = random(0.7, 1);
      const dir = [random(-1, 1) * 0.1, -1];
      vec2.normalize(dir, dir);
      const radius = random(1, 4);
      this._fluid.updateFlow([x, y], dir, strength, radius, noise);
    }

    this._fluid.update();
  }

  updateFluid() {
    const strength = 1;
    const noise = 1;
    const time = Scheduler.getElapsedTime() * 0.5;
    const num = 5;

    for (let i = 0; i < num; i++) {
      const r = random(0.1, 0.3);
      const a = (i / num) * Math.PI * 2 + time + random(-1, 1) * 0.1;
      const pos = [r, 0];
      const dir = [1, 0];
      vec2.rotate(pos, pos, [0, 0], a);
      vec2.rotate(dir, dir, [0, 0], a + random(-1, 1) * 0.2);
      vec2.add(pos, pos, [0.5, 0.5]);

      const radius = random(1, 3);
      this._fluid.updateFlow(pos, dir, strength, radius, noise);
    }

    this._fluid.update();
  }

  render() {
    if (!this._hasFaceDetected || !this._fboFace.texture) {
      return;
    }
    const bgColor = [192, 158, 121].map(toGlsl);
    let g = 0.1;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);

    GL.disable(GL.DEPTH_TEST);

    this._fboRender.read.bind();
    GL.clear(...bgColor, 1);
    this._fboRender.read.unbind();

    // this._dCopy.draw(this._fboFace.texture);
    // this._dCopy.draw(this._fboRender.read.texture);

    this._layersFluid.forEach((layer) => {
      layer.render(this._fboFluid.texture, this._textureChars);

      this._drawLayer
        .bindFrameBuffer(this._fboRender.write)
        .bindTexture("uBaseMap", this._fboRender.read.texture, 0)
        .bindTexture("uMap", layer.texture, 1)
        .draw();

      this._fboRender.swap();
    });

    this._layers.forEach((layer) => {
      layer.render(this._fboFace.getTexture(0), this._textureChars);

      this._drawLayer
        .bindFrameBuffer(this._fboRender.write)
        .bindTexture("uBaseMap", this._fboRender.read.texture, 0)
        .bindTexture("uMap", layer.texture, 1)
        .draw();

      this._fboRender.swap();
    });

    // this._dCopy.draw(this._fboRender.read.texture);
    this._drawCompose
      .bindTexture("uMap", this._fboRender.read.texture, 0)
      .bindTexture("uPaperMap", this._texturePaper, 1)
      .uniform("uRatio", GL.aspectRatio)
      .draw();

    GL.enable(GL.DEPTH_TEST);

    // g = 200;
    // GL.viewport(0, 0, g, g);
    // this._dCopy.draw(this._fluid.density);
    // GL.viewport(g, 0, g, g);
    // this._dCopy.draw(this._fboFluid.texture);
    // GL.viewport(g * 2, 0, g, g);
    // this._dCopy.draw(this._textureNoise);

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    const { innerWidth, innerHeight } = window;
    const pixelRatio = 1;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera.setAspectRatio(GL.aspectRatio);

    // resize fbo
    this._fboFace = new FrameBuffer(GL.width, GL.height);
  }
}

export default SceneApp;
