// SceneApp.js

import alfrid, { Scene, GL } from "alfrid";
import Assets from "./Assets";
import Config from "./Config";
import { resize, biasMatrix } from "./utils";

import FluidSimulation from "./FluidSimulation";
import DrawSave from "./DrawSave";
import DrawDebug from "./DrawDebug";
import DrawSim from "./DrawSim";
import DrawBlocks from "./DrawBlocks";
import { vec3, mat4 } from "gl-matrix";
import trackJoints from "./trackJoints";

const colorThemes = "test,002,003,004,005,006,007,008,009".split(",");

// import DebugCamera from "debug-camera";

class SceneApp extends Scene {
  constructor() {
    super();
    GL.enableAlphaBlending();
    // this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
    this.orbitalControl.radius.value = 4;
    this.orbitalControl.lock();

    this._lightPos = [0, 6, 2.5];
    this.cameraLight = new alfrid.CameraOrtho();
    const s = 4;
    this.cameraLight.ortho(-s, s, s, -s, 1, 8.5);
    this.cameraLight.lookAt(this._lightPos, [0, 0, -1]);

    this._shadowMatrix = mat4.create();
    mat4.multiply(
      this._shadowMatrix,
      this.cameraLight.projection,
      this.cameraLight.viewMatrix
    );
    mat4.multiply(this._shadowMatrix, biasMatrix, this._shadowMatrix);

    this._handLeft = vec3.create();
    this._handRight = vec3.create();

    this._dirHandLeft = vec3.create();
    this._dirHandRight = vec3.create();

    this._trackJoints = [];
    this._bodyIndex = -1;
    this._colorIndex = colorThemes.length - 1;
    this._offsetColor = new alfrid.EaseNumber(0, 0.01);

    window.addEventListener("mousemove", (e) => {
      const r = 0.4;
      const ry = (e.clientX / GL.width - 0.5) * r;
      const rx = (e.clientY / GL.height - 0.5) * r;
      this.orbitalControl.rx.value = rx;
      this.orbitalControl.ry.value = ry;
    });

    this.resize();

    setInterval(() => this.nextColor(), 8000);
    this.nextColor();
  }

  nextColor() {
    this._colorIndex = this.nextColorIndex;
    this._offsetColor.setTo(0);
    this._offsetColor.value = 1;
  }

  _initTextures() {
    console.log("init textures");
    const { numParticles: num } = Config;

    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      wrapS: GL.MIRRORED_REPEAT,
      wrapT: GL.MIRRORED_REPEAT,
    };

    this._fbo = new alfrid.FboPingPong(num, num, oSettings, 4);
    this._fboOrgPos = new alfrid.FrameBuffer(num, num, oSettings);

    const fboSize = 1024;
    this._fboShadow = new alfrid.FrameBuffer(fboSize, fboSize);
    this._textureWhite = alfrid.GLTexture.whiteTexture();
  }

  _initViews() {
    console.log("init views");
    const { planeSize } = Config;

    this._bCopy = new alfrid.BatchCopy();
    this._bAxis = new alfrid.BatchAxis();
    this._bDots = new alfrid.BatchDotsPlane();
    this._bBall = new alfrid.BatchBall();

    this._fluid = new FluidSimulation();
    this._drawSave = new DrawSave();
    this._drawDebug = new DrawDebug();
    this._drawSim = new DrawSim();
    this._drawBlocks = new DrawBlocks();

    this._debugDraw = new alfrid.Draw()
      .setMesh(alfrid.Geom.plane(planeSize, planeSize, 1))
      .useProgram(null, alfrid.ShaderLibs.copyFrag);

    this._drawSave.bindFrameBuffer(this._fbo.read).draw();

    this._fboOrgPos.bind();
    GL.clear(0, 0, 0, 0);
    this._bCopy.draw(this._fbo.read.getTexture(0));
    this._fboOrgPos.unbind();
  }

  update() {
    const { planeSize } = Config;
    const s = planeSize * 0.5;
    this._fluid.update([]);

    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .uniformTexture("texturePos", this._fbo.read.getTexture(0), 0)
      .uniformTexture("textureVel", this._fbo.read.getTexture(1), 1)
      .uniformTexture("textureExtra", this._fbo.read.getTexture(2), 2)
      .uniformTexture("textureData", this._fbo.read.getTexture(3), 3)
      .uniformTexture("textureOrgPos", this._fboOrgPos.texture, 4)
      .uniformTexture("textureVelMap", this._fluid.velocity, 5)
      .uniformTexture("textureDensityMap", this._fluid.density, 6)
      .uniform("uTime", "float", alfrid.Scheduler.deltaTime)
      .uniform("uSize", "float", Config.planeSize / 2)
      .uniform("uSpeed", "float", Config.speed)
      .draw();

    this._fbo.swap();
  }

  updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this.cameraLight);
    this._renderBlocks(false);
    this._fboShadow.unbind();
  }

  _renderBlocks(mShadow) {
    const scale = 0.5;
    const textureDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._textureWhite;
    this._drawBlocks
      .uniformTexture("texturePos", this._fbo.read.getTexture(0), 0)
      .uniformTexture("textureVel", this._fbo.read.getTexture(1), 1)
      .uniformTexture("textureData", this._fbo.read.getTexture(3), 2)
      .uniformTexture("textureDepth", textureDepth, 3)
      .uniformTexture("texturePosOrg", this._fboOrgPos.texture, 4)
      // .uniformTexture("textureColor", Assets.get(Config.color), 5)
      .uniformTexture("textureCurrColor", this.currColorMap, 5)
      .uniformTexture("textureNextColor", this.nexstColorMap, 6)
      .uniform("uShadowMatrix", "mat4", this._shadowMatrix)
      .uniform("uTime", "float", alfrid.Scheduler.deltaTime)
      .uniform("uSize", "float", Config.planeSize / 2)
      .uniform("uOffsetColor", "float", this._offsetColor.value)
      .uniform("uMapSize", "vec2", [
        this._fboShadow.width * scale,
        this._fboShadow.height * scale,
      ])
      .draw();
  }

  render() {
    this.updateShadowMap();
    const g = 0;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);

    Config.debug && this._bAxis.draw();

    this._renderBlocks(true);

    let s = 0.1;
    if (Config.debug) {
      GL.disable(GL.DEPTH_TEST);
      // this._bBall.draw(this._handLeft, [s, s, s], [1, 0, 0]);
      // this._bBall.draw(this._handRight, [s, s, s], [1, 0, 0]);

      this._trackJoints.forEach((joint) => {
        this._bBall.draw(joint.pos, [s, s, s], [1, 0, 0]);
      });

      s = 300;
      GL.viewport(0, 0, s, s);
      this._bCopy.draw(this._fluid.density);
      GL.enable(GL.DEPTH_TEST);
    }
  }

  resize(w, h) {
    resize(w, h);
    this.camera.setAspectRatio(GL.aspectRatio);
  }

  get currColorMap() {
    return Assets.get(colorThemes[this._colorIndex]);
  }

  get nexstColorMap() {
    return Assets.get(colorThemes[this.nextColorIndex]);
  }

  get nextColorIndex() {
    if (this._colorIndex === colorThemes.length - 1) {
      return 0;
    } else {
      return this._colorIndex + 1;
    }
  }
}

export default SceneApp;
