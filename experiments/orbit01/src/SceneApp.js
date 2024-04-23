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
  Geom,
  HitTestor,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { mix, random, toGlsl, RAD, biasMatrix, smoothstep } from "./utils";
import Config from "./Config";
import Assets from "./Assets";
import { vec2, vec3, mat4 } from "gl-matrix";
import Scheduler from "scheduling";
import Star from "./Star";

// fluid simulation
import FluidSimulation from "./fluid-sim";

import generatePaperTexture from "./generatePaperTexture";
import generateNoiseTexture from "./generateNoiseTexture";
import applyBlur from "./applyBlur";

import DrawSave from "./DrawSave";
import DrawParticles from "./DrawParticles";
import DrawSim from "./DrawSim";
import DrawBlocks from "./DrawBlocks";
import DrawStars from "./DrawStars";
import DrawTrail2 from "./DrawTrail2";
import DrawBg from "./DrawBg";
import DrawDebugFluid from "./DrawDebugFluid";
import DrawCompose from "./DrawCompose";

// pose detection
import PoseDetection, { POSE_FOUND, POSE_LOST } from "./PoseDetection";
import TrackPoint from "./TrackPoint";

const hitTestPlaneSize = 25;

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }
  }

  _init() {
    this.resize();

    // create stars
    let r = 4;
    const getPos = () => vec3.random(vec3.create(), random(r));
    const rndMass = () => mix(2, 16, Math.pow(random(), 3));

    this._star0 = new Star(getPos(), rndMass());
    this._star1 = new Star(getPos(), rndMass());
    this._star2 = new Star(getPos(), rndMass());

    this._stars = [];
    const { numStars } = Config;
    for (let i = 0; i < numStars; i++) {
      this._stars.push(new Star(getPos(), rndMass()));
    }

    // this._stars = [this._star0, this._star1, this._star2];

    // camera
    this.camera.setPerspective(90 * RAD, GL.aspectRatio, 0.1, 100);
    this.orbitalControl.radius.value = 10;

    // light
    this._light = [0, 10, 1];
    vec3.rotateZ(this._light, this._light, [0, 0, 0], -0.2);
    vec3.rotateX(this._light, this._light, [0, 0, 0], 0.2);
    this._cameraLight = new CameraOrtho();
    r = 10;
    this._cameraLight.ortho(-r, r, r, -r, 1, 30);
    this._cameraLight.lookAt(this._light, [0, 0, 0]);

    // shadow matrix
    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);

    // hit testing
    r = hitTestPlaneSize;
    const mesh = Geom.plane(r, r, 1);
    this._hitTestor = new HitTestor(mesh, this.camera);
    this._hit = [999, 999, 999];
    this._preHit = [999, 999, 999];
    // this._hitTestor.on("onHit", (e) => {
    //   vec3.copy(this._hit, e.hit);
    // });

    const hitBind = this.onHit.bind(this);

    this._hitTestor.on("onHit", hitBind);
    this._hitTestor.on("onUp", () => {
      vec3.set(this._hit, 999, 999, 999);
      vec3.set(this._preHit, 999, 999, 999);
    });
    this._drawDebugFluid = new DrawDebugFluid(mesh);

    // fluid
    const DISSIPATION = 0.985;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    if (Config.usePoseDetection) this._initPoseDetection();
  }

  _initPoseDetection() {
    const ratio = GL.aspectRatio;
    this._trackedPoints = [
      new TrackPoint(),
      new TrackPoint(),
      new TrackPoint(),
    ];

    this._poseDetection = new PoseDetection();
    this._poseDetection.on(POSE_FOUND, (o) => {
      o.forEach((p, i) => {
        if (p.score > 0.5 && i > 0) {
          this._trackedPoints[i].update(p.pos);
          const { pos, dir, speed } = this._trackedPoints[i];
          let f = smoothstep(0.01, 0.05, speed);
          // this._fluid.updateFlow
          const adjPos = [pos[0], pos[1]];
          adjPos[0] = (adjPos[0] - 0.5) / ratio + 0.5;
          this._fluid.updateFlow(adjPos, dir, mix(2, 8, f), mix(2, 3, f), 1);
        }
      });

      const { canvas, video } = this._poseDetection;
      if (!canvas.classList.contains("ready")) {
        canvas.classList.add("ready");
        video.classList.add("ready");
      }
    });

    this._poseDetection.on(POSE_LOST, () => {
      this._trackedPoints.forEach((p) => p.reset());
    });
  }

  onHit(e) {
    if (this._preHit[0] > 100) {
      vec3.copy(this._preHit, e.hit);
    } else {
      vec3.copy(this._preHit, this._hit);
    }
    vec3.copy(this._hit, e.hit);
    let r = hitTestPlaneSize / 2;
    let d = vec3.distance(this._preHit, this._hit);
    let f = smoothstep(0, 1, d);

    if (f > 0) {
      const mtxInvert = mat4.invert(mat4.create(), this._hitTestor.modelMatrix);
      const pInverted = vec3.transformMat4(vec3.create(), this._hit, mtxInvert);
      const pInvertedPrev = vec3.transformMat4(
        vec3.create(),
        this._preHit,
        mtxInvert
      );

      let x = (pInverted[0] / r) * 0.5 + 0.5;
      let y = (pInverted[1] / r) * 0.5 + 0.5;

      const dir = [
        pInverted[0] - pInvertedPrev[0],
        pInverted[1] - pInvertedPrev[1],
      ];
      vec2.normalize(dir, dir);

      this._fluid.updateFlow([x, y], dir, mix(1, 4, f), mix(1, 3, f), 1);
    }
  }

  _initTextures() {
    // init particles
    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };

    const { numParticles: num } = Config;
    this._fbo = new FboPingPong(num, num, oSettings, 4);

    const fboSize = 1024 * 2;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
    });

    this._textureParticle = Assets.get("particle");
    this._textureColor = Assets.get("color");
    this._texturePaper = generatePaperTexture();
    this._textureNoise = generateNoiseTexture();

    this._fboRender = new FrameBuffer(GL.width, GL.height);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    new DrawSave()
      .bindFrameBuffer(this._fbo.read)
      .setClearColor(0, 0, 0, 1)
      .draw();

    this._drawSim = new DrawSim();
    this._drawParticles = new DrawParticles();
    this._drawBlocks = new DrawBlocks();
    this._drawStars = new DrawStars();
    this._drawBg = new DrawBg();
    this._drawCompose = new DrawCompose();

    this._trails = this._stars.map((star) => {
      const drawTrail = new DrawTrail2();
      drawTrail.reset(star.position);
      return drawTrail;
    });
  }

  _updateStars() {
    let G = 0.0006;
    const maxRadius = 5;
    for (let i = 0; i < this._stars.length; i++) {
      const star0 = this._stars[i];
      for (let j = 0; j < this._stars.length; j++) {
        if (i === j) continue;
        const star1 = this._stars[j];
        let dir = vec3.sub(vec3.create(), star1.position, star0.position);
        let r = vec3.length(dir);
        r = Math.max(r, 0.1);
        vec3.normalize(dir, dir);
        let f = ((star0.mass * star1.mass) / (r * r)) * G;
        vec3.scale(dir, dir, f);
        vec3.add(star0.acc, star0.acc, dir);
      }

      vec3.scale(star0.acc, star0.acc, 1 / star0.mass);

      // pull back to center
      let dir = vec3.sub(vec3.create(), [0, 0, 0], star0.position);
      let r = vec3.length(dir);

      let f = smoothstep(4.0, maxRadius, r);

      vec3.normalize(dir, dir);
      vec3.scale(dir, dir, 0.0075 * f);
      vec3.add(star0.acc, star0.acc, dir);

      // if (r > maxRadius) {
      //   vec3.normalize(dir, dir);
      //   let f = (r - maxRadius) * 0.2;
      //   vec3.scale(dir, dir, f);
      //   vec3.add(star0.acc, star0.acc, dir);
      //   vec3.scale(star0.velocity, star0.velocity, 0.7);
      // }

      vec3.add(star0.velocity, star0.velocity, star0.acc);
      vec3.add(star0.position, star0.position, star0.velocity);

      // reset force
      vec3.scale(star0.acc, star0.acc, 0);
      vec3.scale(star0.velocity, star0.velocity, 0.95);
    }

    // update star traisl
    this._trails.forEach((drawTrail, i) => {
      drawTrail.update(this._stars[i].position);
    });
  }

  update() {
    this._fluid.update();

    // update light position
    this._light = [0, 10, 1];
    vec3.rotateZ(this._light, this._light, [0, 0, 0], -0.2);
    vec3.rotateX(
      this._light,
      this._light,
      [0, 0, 0],
      0.2 + this.orbitalControl.rx.value
    );

    vec3.rotateY(
      this._light,
      this._light,
      [0, 0, 0],
      this.orbitalControl.ry.value
    );
    // this._cameraLight.ortho(-r, r, r, -r, 1, 30);
    this._cameraLight.lookAt(this._light, [0, 0, 0]);

    mat4.mul(
      this.mtxShadow,
      this._cameraLight.projection,
      this._cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);

    this.orbitalControl.ry.value -= 0.01;
    this._updateStars();

    let centers = this._stars
      .map(({ position, mass }) => {
        return [...position, mass];
      })
      .flat();

    const mtxInvert = mat4.invert(mat4.create(), this._hitTestor.modelMatrix);

    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uFluidMap", this._fluid.velocity, 4)
      .bindTexture("uDensityMap", this._fluid.density, 5)
      .uniform("uCameraMatrix", this._hitTestor.modelMatrix)
      .uniform("uInvertMatrix", mtxInvert)
      .uniform("uCenters", "vec4", centers)
      .uniform("uTime", Scheduler.getElapsedTime())
      .uniform("uBound", hitTestPlaneSize / 2)
      .draw();

    this._fbo.swap();

    // update shadow map
    this._fboShadow.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this._cameraLight);
    this._renderParticles(false);
    this._fboShadow.unbind();

    // update hit test
    const mtx = mat4.create();
    mat4.rotateY(mtx, mtx, this.orbitalControl.ry.value);
    mat4.rotateX(mtx, mtx, this.orbitalControl.rx.value);
    // mat4.invert(mtx, mtx);
    mat4.copy(this._hitTestor.modelMatrix, mtx);
  }

  _renderParticles(mShadow) {
    const tDepth = mShadow
      ? this._fboShadow.depthTexture
      : this._fbo.read.getTexture(0);

    const particleScale = mShadow ? 1 : 1.5;
    const size = this._fboShadow.width;
    const vp = mShadow ? [GL.width, GL.height] : [size, size];

    const showParticles = true;

    if (showParticles) {
      this._drawParticles
        .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
        .bindTexture("uMap", this._textureParticle, 1)
        .bindTexture("uDepthMap", tDepth, 2)
        .bindTexture("uColorMap", this._textureColor, 3)
        .uniform("uViewport", vp)
        .uniform("uShadowMatrix", this.mtxShadow)
        .uniform("uParticleScale", particleScale)
        .draw();

      this._drawBlocks
        .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
        .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
        .bindTexture("uDepthMap", tDepth, 2)
        .bindTexture("uColorMap", this._textureColor, 3)
        .uniform("uShadowMatrix", this.mtxShadow)
        .uniform("uLight", this._light)
        .uniform("uColor", [1, 1, 1])
        .draw();
    }

    // stars
    const positions = this._stars.map(({ position, mass }) => {
      return [...position, Math.sqrt(mass)];
    });

    this._drawStars.mesh.bufferInstance(positions, "aPosAndSize");

    this._drawStars
      .bindTexture("uDepthMap", tDepth, 2)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uLight", this._light)
      .uniform("uColor", [0.8, 0.05, 0])
      .draw();

    // star trails
    let g = 0.8;
    const trailColor = [g, g, g * 0.92];
    // const trailColor = [0.9, 0.5, 0.0];
    this._trails.forEach((drawTrail) => {
      drawTrail
        .bindTexture("uDepthMap", tDepth, 2)
        .uniform("uShadowMatrix", this.mtxShadow)
        .uniform("uLight", this._light)
        .uniform("uColor", trailColor)
        .draw();
    });
  }

  render() {
    const { postEffect } = Config;
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    if (postEffect) {
      this._fboRender.bind();
      GL.clear(...Config.colorBg.map(toGlsl), 1);
    }

    GL.disable(GL.DEPTH_TEST);
    this._drawBg
      .uniform("uRatio", GL.aspectRatio)
      .uniform("uColor", [g, g, g * 0.96])
      .draw();

    this._drawDebugFluid
      .bindTexture("uMap", this._fluid.density, 0)
      .bindTexture("uNoiseMap", this._textureNoise, 1)
      .uniform("uInvertMatrix", this._hitTestor.modelMatrix)
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();
    GL.enable(GL.DEPTH_TEST);

    this._renderParticles(true);

    // g = 0.1;
    // this._dBall.draw(this._hit, [g, g, g], [1, 0.5, 0]);
    if (postEffect) {
      this._fboRender.unbind();

      this._textureBlur = applyBlur(this._fboRender.texture);

      // this._dCopy.draw(this._textureBlur);
      this._drawCompose
        .uniform("uRatio", GL.aspectRatio)
        .bindTexture("uMap", this._fboRender.texture, 0)
        .bindTexture("uBlurMap", this._textureBlur, 1)
        .bindTexture("uNoiseMap", this._textureNoise, 2)
        .draw();

      // g = 400;
      // GL.viewport(0, 0, g, g);
      // this._dCopy.draw(this._fluid.density);
    }
  }

  resize() {
    if (!GL.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1.5;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);
    }
    this._fboRender = new FrameBuffer(GL.width, GL.height);
    console.log(9 / 16, 4 / 5, GL.aspectRatio);
  }
}

export default SceneApp;
