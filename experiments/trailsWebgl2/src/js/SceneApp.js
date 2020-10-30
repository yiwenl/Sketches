// SceneApp.js

import alfrid, { Scene, GL } from "alfrid";
import Assets from "./Assets";
import Config from "./Config";
import { resize, biasMatrix } from "./utils";

import getColorTheme from "get-color-themes";
import { vec3 } from "gl-matrix";

// draw calls
import DrawSave from "./DrawSave";
import DrawSim from "./DrawSim";
import DrawTrails from "./DrawTrails";

const colorMaps = "001,002,003,004,005,006,007,008,009,test".split(",");

class SceneApp extends Scene {
  constructor() {
    super();

    GL.enableAlphaBlending();
    this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.1;
    this.orbitalControl.radius.value = GL.isMobile ? 10 : 8;

    if (GL.isMobile) {
      this.orbitalControl.radius.easing = 0.025;
    }

    this._seed = Math.random() * 0xff;
    this._speed = new alfrid.EaseNumber(1, 0.1);

    // hit
    this._hit0 = vec3.create();
    this._hit1 = vec3.create();

    // shadow
    const s = 8;
    this.mesh = alfrid.Geom.plane(s, s / 2, 1);
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

    // pausin
    this._isPaused = false;
    window.addEventListener("touchstart", (e) => {
      this._isPaused = true;
      this.orbitalControl.radius.value = 8;
      document.body.classList.add("hideDesc");
    });

    window.addEventListener("touchend", (e) => {
      this._isPaused = false;
      this.orbitalControl.radius.value = 10;
    });
    this.resize();
  }

  _initTextures() {
    console.log("init textures");

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

    this._textureGrey = alfrid.GLTexture.greyTexture();
  }

  _initViews() {
    console.log("init views");
    const theme = getColorTheme();

    this._bCopy = new alfrid.BatchCopy();
    this._bAxis = new alfrid.BatchAxis();
    this._bDots = new alfrid.BatchDotsPlane();
    this._bBall = new alfrid.BatchBall();

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
      .uniform("uSpeed", "float", this._speed.value)
      .draw();

    this._fboTrails.swap();
  }

  updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(1, 0, 0, 1);
    GL.setMatrices(this._cameraTop);
    this.renderTrails(true);
    this._fboShadow.unbind();
  }

  renderTrails(mShadow) {
    const { trailLength, numSets } = Config;

    this._drawTrails
      .uniform("uShadowMatrix", "mat4", this._mtxShadow)
      .uniform("uLight", "vec3", this._lightPos)
      .uniform("uIsDepth", "float", mShadow ? 1.0 : 0.0)
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
    const g = 0.0;
    GL.clear(g, g, g * 0.5, 1);

    this.renderTrails(false);
  }

  resize(w, h) {
    const ratio = GL.isMobile ? 2 : 1;
    const tw = window.innerWidth * ratio;
    const th = window.innerHeight * ratio;

    resize(tw, th);
    this.camera.setAspectRatio(GL.aspectRatio);
  }
}

export default SceneApp;
