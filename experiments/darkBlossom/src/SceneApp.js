import {
  GL,
  FrameBuffer,
  FboPingPong,
  CameraOrtho,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  Scene,
  HitTestor,
} from "alfrid";
import { RAD, toGlsl, random, smoothstep, biasMatrix } from "./utils";
import Config from "./Config";

import { vec3, mat4, vec2 } from "gl-matrix";
import Scheduler from "scheduling";

import DrawFloor from "./DrawFloor";
import DrawSave from "./DrawSave.js";
import DrawPetals from "./DrawPetals.js";
import DrawSim from "./DrawSim.js";
import DrawCover from "./DrawCover.js";

// textures
import generateBlueNoise from "./generateBlueNoise.js";

class SceneApp extends Scene {
  constructor() {
    super();

    this._seedTime = random(100);
    this.camera.setPerspective(70 * RAD, GL.aspectRatio, 0.1, 100);
    const radiusLimit = 12;
    this.orbitalControl.radius.limit(radiusLimit, radiusLimit);
    this.orbitalControl.radius.setTo(radiusLimit);

    this.orbitalControl.rx.limit(0.1, -Math.PI / 2 + 0.1);

    // shadow
    let r = 10;
    this._lightPosition = [0.1, 20, 0.1];
    this._cameraLight = new CameraOrtho();
    this._cameraLight.ortho(-r, r, r, -r, 7, 23);
    this._cameraLight.lookAt(this._lightPosition, [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);

    // this.orbitalControl.lock();

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this._hit = [999, 999, 999];
        this._preHit = [999, 999, 999];
      }
    });

    addEventListener("blur", (event) => {
      this._hit = [999, 999, 999];
      this._preHit = [999, 999, 999];
    });
  }

  _initTextures() {
    this.resize();

    const { numParticles: num } = Config;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };
    const oSettingsShadow = {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    };

    this._fbo = new FboPingPong(num, num, oSettings, 4);
    this._fboPosOrg = new FrameBuffer(num, num, oSettings);
    this._fboRender = new FrameBuffer(GL.width, GL.height);

    let fboSize = 1024 * 2;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, oSettingsShadow);

    // textures
    this._textureNoise = generateBlueNoise();
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();
    this._drawFloor = new DrawFloor();
    this._drawPetals = new DrawPetals();
    this._drawCover = new DrawCover();

    // init particles
    this._drawSim = new DrawSim();
    new DrawSave().bindFrameBuffer(this._fbo.read).draw();
    this._fboPosOrg.bind();
    GL.clear(0, 0, 0, 1);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPosOrg.unbind();

    // hit test
    this._hit = [999, 999, 999];
    this._preHit = [999, 999, 999];
    this._hitTestor = new HitTestor(this._drawFloor.mesh, this.camera);
    this._hitTestor.on("onHit", (e) => {
      if (this._preHit[0] > 100) {
        vec3.copy(this._preHit, e.hit);
      } else {
        vec3.copy(this._preHit, this._hit);
      }
      vec3.copy(this._hit, e.hit);
      const r = 5;
      const pxz = [this._hit[0], this._hit[2]];
      if (vec2.length(pxz) > r) {
        vec2.normalize(pxz, pxz);
        vec2.scale(pxz, pxz, r);
        this._hit[0] = pxz[0];
        this._hit[2] = pxz[1];
      }
    });

    this._hitTestor.on("onUp", () => {
      this._hit = [999, 999, 999];
      this._preHit = [999, 999, 999];
    });
  }

  update() {
    let d = vec3.distance(this._hit, this._preHit);
    d = smoothstep(0, 0.4, d);
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uPosOrgMap", this._fboPosOrg.texture, 4)
      .uniform("uTime", Scheduler.getElapsedTime() + this._seedTime)
      .uniform("uTouch", this._hit)
      .uniform("uFloor", Config.floorLevel)
      .uniform("uEmitStrength", d)
      .draw();

    this._fbo.swap();

    GL.disable(GL.CULL_FACE);
    this._updateShadowMap();
  }

  _updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 1);
    GL.setMatrices(this._cameraLight);
    this._renderPetals(false);
    this._fboShadow.unbind();
  }

  _renderPetals(mShadow = false) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fboPosOrg.texture;

    const { colorShadow, colorPetal } = Config;

    this._drawPetals
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 1)
      .bindTexture("uDepthMap", tDepth, 2)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uLight", this._lightPosition)
      .uniform("uColor", colorPetal.map(toGlsl))
      .uniform("uColorShadow", colorShadow.map(toGlsl))
      .draw();
  }

  render() {
    let g = 0.1;
    const colorBg = Config.colorBg.map(toGlsl);
    const colorCover = Config.colorCover.map(toGlsl);
    const colorShadow = Config.colorShadow.map(toGlsl);
    GL.clear(...colorBg, 1);
    GL.setMatrices(this.camera);

    this._renderPetals(true);
    GL.enable(GL.CULL_FACE);
    this._drawFloor
      .bindTexture("uDepthMap", this._fboShadow.depthTexture, 0)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uColor", colorBg)
      .uniform("uColorShadow", colorShadow)
      .draw();

    GL.disable(GL.DEPTH_TEST);
    this._drawCover
      .bindTexture("uMap", this._textureNoise, 0)
      .uniform("uRatio", GL.aspectRatio)
      .uniform("uColor", colorCover)
      .draw();
    GL.enable(GL.DEPTH_TEST);
  }

  resize() {
    const pixelRatio = 2;
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera?.setAspectRatio?.(GL.aspectRatio);
  }
}

export default SceneApp;
