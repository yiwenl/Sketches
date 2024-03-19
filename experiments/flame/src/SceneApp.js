import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  Scene,
  FboPingPong,
  FrameBuffer,
  CameraOrtho,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { random, randomInt, toGlsl, saveImage, getDateString } from "./utils";
import Config from "./Config";
import { vec2 } from "gl-matrix";
import Scheduler from "scheduling";

// draw calls
import DrawParticles from "./DrawParticles";
import DrawSave from "./DrawSave";
import DrawSim from "./DrawSim";

// fluid simulation
import FluidSimulation from "./fluid-sim";

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    // this.orbitalControl.lock();

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  _init() {
    this.resize();

    // fluid
    const DISSIPATION = 0.985;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    // light
    this._light = [0, 7, 2];
    this._cameraLight = new CameraOrtho();
    const r = 7;
    const ratio = 0.6;
    this._cameraLight.ortho(-r, r, r * ratio, -r * ratio, 2, 12);
    this._cameraLight.lookAt(this._light, [0, 0, 0]);
  }

  _initTextures() {
    const { numParticles: num } = Config;

    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };

    this._fbo = new FboPingPong(num, num, oSettings, 4);
    this._fboPos = new FrameBuffer(num, num, oSettings);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    this._drawSim = new DrawSim();
    this._drawParticles = new DrawParticles();
    new DrawSave()
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(this._fbo.read)
      .draw();

    this._fboPos.bind();
    GL.clear(0, 0, 0, 0);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPos.unbind();
  }

  _updateFluid() {
    let time = Scheduler.getElapsedTime() * 0.1;

    let num = randomInt(4, 6);
    for (let i = 0; i < num; i++) {
      let x = ((i / num + time) % 1) + (random(-1, 1) * 0.2) / num;
      let y = random(0.1, 0.4);

      let dir = [random(-1, 1) * 0.2, 1];
      vec2.normalize(dir, dir);
      let strength = random(1, 5);
      let radius = random(1, 4);
      this._fluid.updateFlow([x, y], dir, strength, radius, 1);
    }

    this._fluid.update();
  }

  update() {
    this._updateFluid();

    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uPosOrgMap", this._fboPos.texture, 4)
      .bindTexture("uFluidMap", this._fluid.velocity, 5)
      .bindTexture("uDensityMap", this._fluid.density, 6)
      .uniform("uBound", 4)
      .draw();

    this._fbo.swap();
  }

  render() {
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();
    this._drawParticles
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 1)
      .uniform("uViewport", [GL.width, GL.height])
      .draw();

    g = 0.05;
    const r = 4;
    this._dBall.draw([-r, -r, 0], [g, g, g], [1, 0, 0]);
    this._dBall.draw([r, -r, 0], [g, g, g], [1, 0, 0]);
    this._dBall.draw([r, r, 0], [g, g, g], [1, 0, 0]);
    this._dBall.draw([-r, r, 0], [g, g, g], [1, 0, 0]);

    g = 0.1;
    this._dBall.draw(this._light, [g, g, g], [1, 0.5, 0]);

    this._dCamera.draw(this._cameraLight, [1, 1, 1]);

    g = 200;
    GL.viewport(0, 0, g, g);
    this._dCopy.draw(this._fluid.velocity);
    // this._dCopy.draw(this._fbo.read.getTexture(0));
    GL.viewport(g, 0, g, g);
    this._dCopy.draw(this._fluid.density);
    // this._dCopy.draw(this._fbo.read.getTexture(3));

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
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
