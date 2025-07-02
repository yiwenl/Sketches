import { GL, DrawBall, DrawAxis, DrawCopy, Scene, FboPingPong } from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { toGlsl, saveImage, getDateString } from "./utils";
import Config from "./Config";
import DrawSave from "./DrawSave";
import DrawParticles from "./DrawParticles";
import DrawSim from "./DrawSim";

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
  }

  _initTextures() {
    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };

    const { numParticles: num } = Config;
    this._fbo = new FboPingPong(num, num, oSettings, 4);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dParticles = new DrawParticles();
    this._dSim = new DrawSim();

    new DrawSave()
      .bindFrameBuffer(this._fbo.read)
      .setClearColor(0, 0, 0, 1)
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
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();

    this._dParticles
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .uniform("uViewport", [GL.width, GL.height])
      .draw();

    g = 256;
    GL.viewport(0, 0, g, g);
    this._dCopy.draw(this._fbo.read.getTexture(3));

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    if (!Config.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1.5;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);
    }
  }
}

export default SceneApp;
