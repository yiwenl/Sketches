// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from "alfrid";
import Assets from "./Assets";
import Config from "./Config";
import { resize, biasMatrix } from "./utils";

// draw calls
import DrawSave from "./DrawSave";
import DrawDebug from "./DrawDebug";
import DrawSim from "./DrawSim";
import DrawTrails from "./DrawTrails";
import DrawBackground from "./DrawBackground";

import DebugCamera from "debug-camera";
import getColorTheme from "get-color-themes";
import { getRandomElement } from "randomutils";
import { vec3 } from "gl-matrix";

class SceneApp extends Scene {
  constructor() {
    super();
    GL.enableAlphaBlending();
    // this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
    this.orbitalControl.radius.value = 8;
    // this.orbitalControl.radius.limit(4, 12);
    this._seed = Math.random() * 0xff;

    this._hit0 = vec3.create();
    this._hit1 = vec3.create();

    let s = 8;
    this.mesh = alfrid.Geom.plane(s, s / 2, 1);

    this._detector = new TouchDetector(this.mesh, this.camera);
    this._detector.on("onHit", (e) => {
      vec3.copy(this._hit0, e.detail.hit);
      vec3.scale(this._hit1, this._hit0, -1);
    });

    this._drawHit = new alfrid.Draw()
      .setMesh(this.mesh)
      .useProgram(null, alfrid.ShaderLibs.simpleColorFrag)
      .uniform("color", "vec3", [1, 1, 1])
      .uniform("opacity", "float", 0.2);

    // shadow`
    // s = 6;
    this._cameraTop = new alfrid.CameraOrtho();
    this._cameraTop.ortho(-s, s, s / 2, -s / 2, 0.5, 10);
    this._lightPos = [0, 5, 2];
    this._cameraTop.lookAt(this._lightPos, [0, 0, 0]);
    this._mtxShadow = mat4.create();

    mat4.mul(
      this._mtxShadow,
      this._cameraTop.projectionMatrix,
      this._cameraTop.viewMatrix
    );
    mat4.mul(this._mtxShadow, biasMatrix, this._mtxShadow);

    this._isPaused = false;
    window.addEventListener("keydown", (e) => {
      if (e.keyCode === 32) {
        this._isPaused = !this._isPaused;
      }
    });
    this.resize();
  }

  _initTextures() {
    const { numParticles: num, trailLength, numSets } = Config;

    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };
    this._fboTrails = new alfrid.FboArray(
      trailLength * numSets,
      num,
      num,
      oSettings,
      5
    );

    this._fboOrgPos = new alfrid.FrameBuffer(num, num, oSettings);

    const fboSize = 1024 * 2;
    this._fboShadow = new alfrid.FrameBuffer(fboSize, fboSize);

    const { gui } = window;
    gui
      .add(this._fboShadow, "width")
      .name("Shadow Map Size")
      .listen();

    this._textureGrey = alfrid.GLTexture.greyTexture();
  }

  _initViews() {
    console.log("init views");

    const theme = getColorTheme();
    // this._bgColor = getRandomElement(theme);

    this._bCopy = new alfrid.BatchCopy();
    this._bAxis = new alfrid.BatchAxis();
    this._bDots = new alfrid.BatchDotsPlane();
    this._bBall = new alfrid.BatchBall();

    // background
    this._drawBackground = new DrawBackground();

    // simulation
    this._drawSim = new DrawSim();

    // save init particle position
    this._drawSave = new DrawSave();
    this._drawSave
      .setClearColor(0, 0, 0, 0)
      .bindFrameBuffer(this._fboTrails.read)
      .draw();

    // make a copy of the init position
    this._fboOrgPos.bind();
    GL.clear(0, 0, 0, 0);
    this._bCopy.draw(this._fboTrails.read.getTexture(0));
    this._fboOrgPos.unbind();

    // debug points
    this._drawDebug = new DrawDebug();

    // trails
    this._drawTrails = new DrawTrails(theme);

    this._bgColor = this._drawTrails.randomColor;
  }

  update() {
    if (this._isPaused) {
      return;
    }

    const { trailLength, numSets } = Config;

    const totalFrames = trailLength * numSets;
    this._drawSim
      .bindFrameBuffer(this._fboTrails.write)
      .uniformTexture("texturePos", this._fboTrails.read.getTexture(0), 0)
      .uniformTexture("textureVel", this._fboTrails.read.getTexture(1), 1)
      .uniformTexture("textureExtra", this._fboTrails.read.getTexture(2), 2)
      .uniformTexture("textureData", this._fboTrails.read.getTexture(3), 3)
      .uniformTexture("textureCenter", this._fboTrails.read.getTexture(4), 4)
      .uniformTexture("textureOrgPos", this._fboOrgPos.texture, 5)
      .uniform("uTime", "float", alfrid.Scheduler.deltaTime + this._seed)
      .uniform("uNoiseScale", "float", Config.noiseScale)
      .uniform("uCenter0", "vec3", this._hit0)
      .uniform("uCenter1", "vec3", this._hit1)
      .uniform("uNumFrames", "float", totalFrames)
      .draw();

    this._fboTrails.swap();
  }

  updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this._cameraTop);
    this.renderTrails(true);

    this._fboShadow.unbind();
  }

  renderTrails(mShadow) {
    const { trailLength, numSets } = Config;

    this._drawTrails
      .uniform("uShadowMatrix", "mat4", this._mtxShadow)
      .uniform("uLight", "vec3", this._lightPos)
      .uniform("uMapSize", "vec2", [
        this._fboShadow.width,
        this._fboShadow.height,
      ]);

    for (let j = 0; j < numSets; j++) {
      for (let i = 0; i < trailLength; i++) {
        const t = this._fboTrails.all[i + j * trailLength - j].getTexture(0);
        this._drawTrails.uniformTexture(`texture${i}`, t, i);
      }

      this._drawTrails
        .uniformTexture("textureData", this._fboTrails.write.getTexture(3), 15)
        .uniformTexture(
          "textureShadow",
          mShadow ? this._textureGrey : this._fboShadow.depthTexture,
          16
        )
        .uniformTexture("textureColor", Assets.get("test"), 17)
        .draw();
    }
  }

  render() {
    this.updateShadowMap();
    GL.setMatrices(this.camera);
    // GL.clear(0, 0, 0, 1);
    const g = 0.5;
    GL.clear(
      this._bgColor[0] * g,
      this._bgColor[1] * g,
      this._bgColor[2] * g,
      1
    );

    this._drawBackground.uniform("uColor", "vec3", this._bgColor).draw();

    if (Config.helperLines) {
      this._bAxis.draw();
    }
    this.renderTrails(false);

    if (Config.helperLines) {
      const s = 0.05;
      this._bBall.draw(this._hit0, [s, s, s], [1, 0, 0]);
      DebugCamera(this._cameraTop);
    }
    // this._drawHit.draw();

    // const s = Config.numParticles;

    // let s = 300;
    // GL.viewport(0, 0, s, s);
    // this._bCopy.draw(this._fboShadow.depthTexture);

    // this._bCopy.draw(this._fboTrails.read.getTexture(0));
    // GL.viewport(s, 0, s, s);
    // this._bCopy.draw(this._fboTrails.write.getTexture(0));
    // GL.viewport(s * 2, 0, s, s);
    // this._bCopy.draw(this._fboTrails.read.getTexture(2));
  }

  resize(w, h) {
    resize(w, h);
    this.camera.setAspectRatio(GL.aspectRatio);
  }
}

export default SceneApp;
