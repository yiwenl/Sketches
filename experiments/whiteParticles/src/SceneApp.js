import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  Scene,
  FrameBuffer,
  FboPingPong,
  CameraOrtho,
  TweenNumber,
  HitTestor,
} from "alfrid";
import {
  RAD,
  mix,
  random,
  randomInt,
  toGlsl,
  biasMatrix,
  smoothstep,
  saveImage,
  getDateString,
} from "./utils";
import Config from "./Config";
import Assets from "./Assets";
import Scheduler from "scheduling";
import { vec2, vec3, mat4 } from "gl-matrix";

// pose detection
import PoseDetection, { POSE_FOUND, POSE_LOST } from "./PoseDetection";

// fluid simulation
import FluidSimulation from "./fluid-sim";

// draw calls
import DrawFluid from "./DrawFluid";
import DrawSave from "./DrawSave";
import DrawBlocks from "./DrawBlocks";
import DrawSim from "./DrawSim";
import DrawReflection from "./DrawReflection";
import DrawChroma from "./DrawChroma";
import DrawCover from "./DrawCover";
import DrawBg from "./DrawBg";
import DrawDirection from "./DrawDirection";

// utils
import generateNormalMap from "./generateNormalMap";
import generateAOMap from "./generateAOMap";
import generateBlueNoise from "./generateBlueNoise";
import generatePaperTexture from "./generatePaperTexture";

let hasSaved = false;
let canSave = false;

class SceneApp extends Scene {
  constructor() {
    super();

    this.orbitalControl.lock();
    this.camera.setPerspective(45 * RAD, GL.aspectRatio, 6, 15);

    // fluid
    const DISSIPATION = 0.995;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: 0.99,
      VELOCITY_DISSIPATION: 0.98,
      PRESSURE_DISSIPATION: 0.98,
    });

    // shadow
    this._cameraLight = new CameraOrtho();
    const r = 8;
    this._lightPosition = [0, 7, 3];
    vec3.rotateX(this._lightPosition, this._lightPosition, [0, 0, 0], 0.3);
    this._cameraLight.ortho(-r, r, r, -r, 1, 15);
    this._cameraLight.lookAt(this._lightPosition, [0, 0, 0]);
    this._startTime = random(100);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);

    // animation
    this._offset = new TweenNumber(0, "linear", 0.005);
    this._theta = 0;
    this._rotation = 0;
    this._numEmit = 6;
    this._rotateDir = 1;
    this._rotateOffsets = [];

    for (let i = 0; i < this._numEmit; i++) {
      this._rotateOffsets.push(random(-1, 1) * 0.75);
    }
    this.pulse();

    // interaction
    this._hit = [0, 0, 0];
    this._preHit = [0, 0, 0];

    if (Config.usePoseDetection) {
      this._initPoseDetection();
    }

    setTimeout(() => {
      canSave = true;
    }, 500);
  }

  pulse() {
    this._rotateDir *= -1;
    this._offset.setTo(0);
    this._offset.value = 1;
    this._theta = random(Math.PI * 2);
    this._rotation = randomInt(3) * 0.25;

    this._numEmit = randomInt(3, 9);
    this._rotateOffsets = [];
    const rotateLimit = random();
    for (let i = 0; i < this._numEmit; i++) {
      this._rotateOffsets.push(random(-1, 1) * rotateLimit);
    }

    setTimeout(() => this.pulse(), 3000);
  }

  _initPoseDetection() {
    this._poseDetection = new PoseDetection();
    this._poseDetection.on(POSE_FOUND, this._onPoseFound);
    this._poseDetection.on(POSE_LOST, () => {
      // this._flowForce.value = 1;
    });
  }

  _onPoseFound = (mPoints) => {
    if (!this._posePoints || this._posePoints.length !== mPoints.length) {
      this._posePoints = mPoints.map(({ pos }) => pos);
    } else {
      const threshold = 0.5;
      mPoints.forEach(({ pos, score }, i) => {
        const dir = vec2.sub([0, 0], pos, this._posePoints[i]);
        let speed = vec2.length(dir);
        let f = smoothstep(0.01, 0.03, speed);
        vec2.normalize(dir, dir);

        if (score > threshold && f > 0) {
          const radius = mix(2, 2.5, f);
          const force = mix(2, 20, f);
          this._fluid.updateFlow(pos, dir, force, radius, 0.5);
        }
        vec2.copy(this._posePoints[i], pos);
      });
    }
  };

  _initTextures() {
    this.resize();

    this._texturePaper = generatePaperTexture();
    this._textureLookup = Assets.get("lookup");
    this._textureLookup.minFilter = GL.NEAREST;
    this._textureLookup.magFilter = GL.NEAREST;

    const { numParticles: num } = Config;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };

    this._fbo = new FboPingPong(num, num, oSettings, 4);
    this._fboPosOrg = new FrameBuffer(num, num, oSettings);

    this._fboRender = new FrameBuffer(GL.width, GL.height);
    this._fboPost = new FboPingPong(GL.width, GL.height);

    this._fboFluid = new FrameBuffer(
      GL.width,
      GL.height,
      { type: GL.FLOAT },
      2
    );

    let fboSize = 2048;
    this._fboShadow = new FrameBuffer(fboSize, fboSize);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._drawCover = new DrawCover();
    this._drawBg = new DrawBg();

    this._drawFluid = new DrawFluid().bindFrameBuffer(this._fboFluid);

    new DrawSave().bindFrameBuffer(this._fbo.read).draw();
    this._fboPosOrg.bind();
    GL.clear(0, 0, 0, 1);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPosOrg.unbind();

    this._drawBlocks = new DrawBlocks();
    this._drawSim = new DrawSim();
    this._drawReflection = new DrawReflection();
    this._drawChroma = new DrawChroma();
    this._drawDirection = new DrawDirection();

    // hitTestor
    const { meshSize } = this._drawFluid;
    const s = meshSize / 2;
    this._hitTestor = new HitTestor(this._drawFluid.mesh, this.camera);
    this._hitTestor.on("onHit", (e) => {
      vec3.copy(this._preHit, this._hit);
      vec3.copy(this._hit, e.hit);

      const d = vec3.distance(this._preHit, this._hit);
      const f = smoothstep(0.01, 0.1, d);
      const pos = [
        (this._hit[0] / s) * 0.5 + 0.5,
        (this._hit[1] / s) * 0.5 + 0.5,
      ];
      const dir = [
        this._hit[0] - this._preHit[0],
        this._hit[1] - this._preHit[1],
      ];

      const strength = mix(5.0, 10.0, f) * 2;
      const radius = mix(1.0, 2.0, f);
      this._fluid.updateFlow(pos, dir, strength, radius, 0.81);
    });
  }

  update() {
    this._updateFluid();

    // blue noise
    this._textureNoise = generateBlueNoise();

    // update normal map
    this._textureNormal = generateNormalMap(this._fboFluid.getTexture(1));

    // update particles
    let f = Math.sin(this._offset.value * Math.PI);
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uPosOrgMap", this._fboPosOrg.texture, 4)
      .bindTexture("uFluidMap", this._fboFluid.getTexture(0), 5)
      .bindTexture("uDensityMap", this._fboFluid.getTexture(1), 6)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uOffset", f)
      .uniform("uLifeDecrease", this._offset.value < 1 ? 0 : 1)
      .draw();

    this._fbo.swap();

    // render shadow map
    this._updateShadowMap();

    // render
    this._fboRender.bind();
    let g = 0.95;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);
    GL.disable(GL.DEPTH_TEST);
    // this._dCopy.draw(this._texturePaper);
    this._drawBg
      .bindTexture("uMap", this._texturePaper, 0)
      .uniform("uRatio", GL.aspectRatio)
      .draw();
    GL.enable(GL.DEPTH_TEST);
    this._renderBlocks(true);
    this._fboRender.unbind();

    // render ao map
    this._textureAO = generateAOMap(this._fboRender.depthTexture);
  }

  _updateFluid() {
    const num = this._numEmit;
    const { sin, PI } = Math;
    let r = 0.1;
    const time = this._theta;
    let f = sin(this._offset.value * PI);
    f = smoothstep(0.0, 0.8, f);
    f = Math.pow(f, 2) * 0.1;
    const noise = 1;
    const angle = this._rotation * f;

    for (let i = 0; i < num; i++) {
      const rotateOffset = this._rotateOffsets[i] || 0;
      const a = (i / num) * PI * 2 + time + rotateOffset;
      let pos = [r, 0];
      let dir = [1, 0];
      pos = vec2.rotate(pos, pos, [0, 0], a);
      vec2.add(pos, pos, [0.5, 0.5]);
      vec2.rotate(dir, dir, [0, 0], a + angle * this._rotateDir);

      const radius = random(1.5, 2);
      const strength = random(0.75, 1) * f;
      this._fluid.updateFlow(pos, dir, strength, radius, noise);
    }

    r = 0.2;
    // num = 8;
    for (let i = 0; i < num; i++) {
      const rotateOffset = this._rotateOffsets[i] || 0;
      const a = ((i + 0.5) / num) * PI * 2 - time + rotateOffset;
      let pos = [r + random(-1, 1) * 0.1, 0];
      let dir = [-1, 0];
      pos = vec2.rotate(pos, pos, [0, 0], a);
      vec2.add(pos, pos, [0.5, 0.5]);
      vec2.rotate(dir, dir, [0, 0], a + angle * this._rotateDir);

      const radius = random(1, 1.5);
      const strength = random(0.75, 1) * f;
      this._fluid.updateFlow(pos, dir, strength, radius, noise);
    }

    this._fluid.update();

    // draw fluid map
    this._drawFluid
      .bindTexture("uDensityMap", this._fluid.density, 0)
      .bindTexture("uVelocityMap", this._fluid.velocity, 1)
      .draw();
  }

  _updateShadowMap() {
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 1);
    GL.setMatrices(this._cameraLight);
    this._renderBlocks(false);
    this._fboShadow.unbind();
  }

  _renderBlocks(mShadow = false) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fboPosOrg.texture;

    this._drawBlocks
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 2)
      .bindTexture("uDepthMap", tDepth, 3)
      .bindTexture("uNoiseMap", this._textureNoise, 4)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uLight", this._lightPosition)
      .uniform("uResolution", [GL.width, GL.height])
      .uniform("uColorShadow", Config.colorShadow.map(toGlsl))
      .uniform("uColorDiffuse", Config.colorDiffuse.map(toGlsl))
      .draw();
  }

  render() {
    let g = 0.1;
    GL.clear(g, g, g, 1);
    GL.setMatrices(this.camera);

    GL.disable(GL.DEPTH_TEST);

    this._drawChroma
      .bindTexture("uMap", this._fboRender.texture, 0)
      .bindTexture("uNormalMap", this._textureNormal, 1)
      .bindTexture("uAOMap", this._textureAO, 2)
      .bindTexture("uLookupMap", this._textureLookup, 3)
      .uniform("uColorAO", Config.colorAO.map(toGlsl))
      .draw();
    // this._dCopy.draw(this._textureNormal);

    this._drawDirection
      .bindTexture("uMap", this._fluid.velocity, 0)
      .bindTexture("uDensityMap", this._fluid.density, 1)
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();

    if (Config.showReflection) {
      this._drawReflection
        .bindTexture("uNormalMap", this._textureNormal, 0)
        .bindTexture("uNoiseMap", this._textureNoise, 1)
        .bindTexture("uLookupMap", this._textureLookup, 2)
        .uniform("uColor", Config.colorReflection0.map(toGlsl))
        .uniform("uLight", [0.3, 0.1, 1.0])
        .draw();

      this._drawReflection
        .bindTexture("uNormalMap", this._textureNormal, 0)
        .bindTexture("uNoiseMap", this._textureNoise, 1)
        .bindTexture("uLookupMap", this._textureLookup, 2)
        .uniform("uColor", Config.colorReflection1.map(toGlsl))
        .uniform("uLight", [-0.3, 0.0, 1.0])
        .draw();
    }

    this._drawCover
      .bindTexture("uMap", this._textureNoise, 0)
      .bindTexture("uLookupMap", this._textureLookup, 1)
      .uniform("uRatio", GL.aspectRatio)
      .draw();

    GL.enable(GL.DEPTH_TEST);

    if (canSave && !hasSaved && Config.autoSave) {
      saveImage(GL.canvas, getDateString());
      hasSaved = true;
    }
  }

  resize() {
    const pixelRatio = 1.5;
    const { innerWidth, innerHeight } = window;
    GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
    this.camera?.setAspectRatio?.(GL.aspectRatio);
  }
}

export default SceneApp;
