import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  Scene,
  FrameBuffer,
  FboPingPong,
  CameraOrtho,
  HitTestor,
  Geom,
  EaseNumber,
} from "alfrid";

import { RAD, random, randomInt, getMonoColor, biasMatrix } from "./utils";
import Config from "./Config";
import Assets from "./Assets";
import Scheduler from "scheduling";
import { vec3, mat4 } from "gl-matrix";

// particles
import DrawSave from "./DrawSave";
import DrawParticles from "./DrawParticles";
import DrawSim from "./DrawSim";
import DrawRibbon from "./DrawRibbon";
import DrawCover from "./DrawCover";
import DrawBackground from "./DrawBackground";

import generateBlueNoise from "./generateBlueNoise";
import generateBg from "./generateBg";

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();
    // this.orbitalControl.lock();

    this.orbitalControl.radius.value = 6;
    this.orbitalControl.radius.limit(5, 12);
    this.camera.setPerspective(90 * RAD, GL.aspectRatio, 0.1, 100);

    // shadow
    const r = 5;
    this._lightPosition = [0.1, 5, 5];
    vec3.rotateY(this._lightPosition, this._lightPosition, [0, 0, 0], 0.5);
    this._cameraLight = new CameraOrtho();
    this._cameraLight.ortho(-r, r, r, -r, 2, 15);
    this._cameraLight.lookAt(this._lightPosition, [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);

    this._seedTime = random(1000);
    this._hit = [999, 999, 999];
    this._center = [0, 0, 0];
    // this._initHit();

    this.speed = new EaseNumber(1, 0.08);
    this.lengthScale = new EaseNumber(0, 0.1);
    this.noiseScale = 1;
    this.pulse();

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  pulse() {
    this.speed.setTo(20);

    this._seedTime += random(500, 1000);
    const radius = 0.5;
    this._center[0] = random(-1, 1) * radius;
    this._center[1] = (random(-1, 1) * radius) / GL.aspectRatio;
    this.lengthScale.value = 1;
    let ns;
    do {
      ns = randomInt(2, 6) * 0.4;
    } while (ns === this.noiseScale);
    this.noiseScale = ns;
    setTimeout(() => {
      this.speed.value = 0.2;
      // console.log("this.noiseScale", this.noiseScale);
      this.lengthScale.value = 0;
    }, 300);
    setTimeout(() => this.pulse(), 2500);
  }

  _initTextures() {
    this.resize();

    const { numParticles: num, numSets } = Config;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };

    this._fbo = new FboPingPong(num, num, oSettings, 4);

    let fboSize = num * numSets;
    this._fboPos = new FrameBuffer(fboSize, fboSize, oSettings);
    this._fboPos.bind();
    GL.clear(0, 0, 0, 1);
    this._fboPos.unbind();

    fboSize = 1024;
    this._fboShadow = new FrameBuffer(fboSize, fboSize);

    // blue noise
    this._textureNoise = generateBlueNoise();

    this._textureColor = Assets.get(`color${Config.colorIndex}`);

    // blur bg
    this._textureBg = generateBg(this._textureColor);

    this._index = 0;
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();
    this._drawCover = new DrawCover();
    this._drawBackground = new DrawBackground();

    // init particles
    new DrawSave().bindFrameBuffer(this._fbo.read).draw();
    this._drawSim = new DrawSim();
    this._drawParticles = new DrawParticles();
    this._drawRibbon = new DrawRibbon();
  }

  _initHit() {
    this._hitTestor = new HitTestor(Geom.sphere(3, 24), this.camera);
    this._hitTestor.on("onHit", (e) => {
      vec3.copy(this._hit, e.hit);
    });

    this._hitTestor.on("onUp", () => {
      this._hit = [999, 999, 999];
    });
  }

  update() {
    let d = 0.5;
    this._center[2] = (1.0 - this.lengthScale.value) * d;

    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .uniform("uTime", Scheduler.getElapsedTime() + this._seedTime)
      .uniform("uSpeed", this.speed.value)
      .uniform("uTouch", this._hit)
      .uniform("uNoiseScale", this.noiseScale)
      .uniform("uCenter", this._center)
      .draw();

    this._fbo.swap();

    const { numParticles: num, numSets: numSetsStr } = Config;
    const numSets = parseInt(numSetsStr);

    const tx = this._index % numSets;
    const ty = Math.floor(this._index / numSets);
    this._index++;
    if (this._index >= numSets * numSets) {
      this._index = 0;
    }

    GL.disable(GL.DEPTH_TEST);
    this._fboPos.bind();
    GL.viewport(tx * num, ty * num, num, num);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPos.unbind();
    GL.enable(GL.DEPTH_TEST);

    this._updateShadowMap(false);
  }

  _updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 1);
    GL.setMatrices(this._cameraLight);
    this._renderRibbon(false);
    this._fboShadow.unbind();
  }

  _renderRibbon(mShadow = false) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fbo.read.getTexture(0);

    this._drawRibbon
      .bindTexture("uPosMap", this._fboPos.texture, 0)
      .bindTexture("uDepthMap", tDepth, 1)
      .bindTexture("uColorMap", this._textureColor, 2)
      .uniform("uIndex", this._index)
      .uniform("uLight", this._lightPosition)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uColor", getMonoColor(1))
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uLengthOffset", this.lengthScale.value)
      .draw();
  }

  render() {
    let g = 0.91;
    GL.clear(...getMonoColor(g), 1);
    GL.setMatrices(this.camera);
    GL.disable(GL.DEPTH_TEST);
    // this._dCopy.draw(this._textureBg);
    this._drawBackground
      .bindTexture("uMap", this._textureBg, 0)
      .uniform("uRatio", GL.aspectRatio)
      .draw();
    GL.enable(GL.DEPTH_TEST);

    this._renderRibbon(true);

    // this._drawParticles
    //   .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
    //   .uniform("uViewport", "vec2", [GL.width, GL.height])
    //   .draw();

    GL.disable(GL.DEPTH_TEST);
    this._drawCover
      .bindTexture("uMap", this._textureNoise, 0)
      .uniform("uRatio", GL.aspectRatio)
      .draw();

    // debug
    // g = 1024 / 2;
    // GL.enable(GL.DEPTH_TEST);
  }

  resize() {
    const pixelRatio = 1.5;
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera?.setAspectRatio?.(GL.aspectRatio);
  }
}

export default SceneApp;
