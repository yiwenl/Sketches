import {
  GL,
  DrawBall,
  DrawAxis,
  DrawCopy,
  DrawCamera,
  Scene,
  FrameBuffer,
  CameraOrtho,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { random, toGlsl, biasMatrix } from "./utils";
import { vec3, mat4 } from "gl-matrix";
import Config from "./Config";
import DrawRender from "./DrawRender";
import DrawPlane from "./DrawPlane";
import DrawRibbon from "./DrawRibbon";
import DrawShadow from "./DrawShadow";

// fluid simulation
import FluidSimulation from "./fluid-sim";

// particle simulation
import ParticleSystem, { centers } from "./ParticleSystem";

import NoiseMap from "./utils/NoiseMap";
import Assets from "./Assets";

const numSets = 32;
const numLines = 24;

class SceneApp extends Scene {
  constructor() {
    super();

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    // this.orbitalControl.lock();
    this.orbitalControl.radius.setTo(19);

    // fluid
    const DISSIPATION = 0.97;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    let num = numSets * numSets;
    while (num--) {
      this.update(false);
    }
  }

  _init() {
    this.resize();

    // shadow
    this.cameraLight = new CameraOrtho();
    this._lightPos = [5, 8, 6];
    vec3.rotateX(this._lightPos, this._lightPos, [0, 0, 0], 0.3);
    const r = 6;
    const ratio = 1;
    this.cameraLight.ortho(-r * ratio, r * ratio, r, -r, 5, 16);
    this.cameraLight.lookAt(this._lightPos, [0, 0, 0]);

    this.mtxShadow = mat4.create();
    mat4.mul(
      this.mtxShadow,
      this.cameraLight.projection,
      this.cameraLight.view
    );
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);
  }

  _initTextures() {
    const fboSize = 1024;
    this._fboShadow = new FrameBuffer(fboSize, fboSize, {
      minFilter: GL.LINEAR,
      magFilter: GL.LINEAR,
      type: GL.UNSIGNED_BYTE,
    });

    // noise map
    this._noiseVelocity = new NoiseMap();
    this._noiseDensity = new NoiseMap(true, true);

    // white texture
    const fbo = new FrameBuffer(4, 4);
    fbo.bind();
    GL.clear(1, 1, 1, 1);
    fbo.unbind();
    this._textureWhite = fbo.texture;
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();

    this._drawShadow = new DrawShadow();

    // particles
    let num = Config.numParticles;
    let num2 = 32;

    console.log(num, num2);

    this._particlesSystems = [
      {
        system: new ParticleSystem(num),
        draw: new DrawRender(num),
      },
      {
        system: new ParticleSystem(num2),
        draw: new DrawPlane(num2),
      },
    ];

    this._systemRibbon = new ParticleSystem(numLines);
    this._drawRibbon = new DrawRibbon(numLines, numSets);

    // position
    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };

    const size = numSets * numLines;
    console.log("Size : ", size);
    this._fboPosRibbon = new FrameBuffer(size, size, oSettings);
    this._index = 0;
  }

  update(mUpdateShadow = true) {
    this._fluid.updateFlowWithMap(
      this._noiseVelocity.texture,
      this._noiseDensity.texture,
      random(0.3, 0.2)
    );
    this._fluid.update();

    this._systemRibbon.update(this._fluid.velocity, this._fluid.density);
    this._particlesSystems.forEach(({ system }) => {
      system.update(this._fluid.velocity, this._fluid.density);
    });

    // update ribbon map
    this._updateRibbonPosMap();

    this._noiseDensity.update();
    this._noiseVelocity.update();

    if (mUpdateShadow) {
      // update shadow map
      this._fboShadow.bind();
      GL.clear(0, 0, 0, 0);
      GL.setMatrices(this.cameraLight);
      this._renderParticles(false);
      this._fboShadow.unbind();
    }
  }

  _updateRibbonPosMap() {
    const tx = this._index % numSets;
    const ty = Math.floor(this._index / numSets);
    this._index++;

    if (this._index >= numSets * numSets) {
      this._index = 0;
    }

    const { fbo } = this._systemRibbon;
    const num = this._systemRibbon.numParticles;

    GL.disable(GL.DEPTH_TEST);
    this._fboPosRibbon.bind();
    GL.viewport(tx * num, ty * num, num, num);
    this._dCopy.draw(fbo.getTexture(0));
    this._fboPosRibbon.unbind();
    GL.enable(GL.DEPTH_TEST);
  }

  _renderParticles(mShadow) {
    const tDepth = mShadow ? this._fboShadow.depthTexture : this._textureWhite;

    this._particlesSystems.forEach(({ system: { fbo }, draw }) => {
      draw
        .bindTexture("uPosMap", fbo.getTexture(0), 0)
        .bindTexture("uVelMap", fbo.getTexture(1), 1)
        .bindTexture("uDataMap", fbo.getTexture(3), 2)
        .bindTexture("uColorMap", fbo.getTexture(4), 3)
        .bindTexture("uDepthMap", tDepth, 4)
        .uniform("uShadowMatrix", this.mtxShadow)
        .uniform("uViewport", [GL.width, GL.height])
        .uniform("uParticleScale", Config.particleScale * mShadow ? 1 : 2)
        .draw();
    });

    if (this._fboPosRibbon.texture) {
      this._drawRibbon
        .bindTexture("uPosMap", this._fboPosRibbon.texture, 0)
        .bindTexture("uDepthMap", tDepth, 1)
        .bindTexture("uColorMap", Assets.get("rippling"), 2)
        .uniform("uIndex", this._index)
        .uniform("uLight", this._lightPos)
        .uniform("uShadowMatrix", this.mtxShadow)
        .uniform("uLengthOffset", 1)
        .draw();
    }
  }

  render() {
    let g = 0.8;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.clear(0, 0, 0, 0);
    // GL.clear(g, g, g * 0.95, 1);
    GL.setMatrices(this.camera);

    // this._dCamera.draw(this.cameraLight, [1, 1, 1]);
    this._renderParticles(true);

    this._drawShadow
      .bindTexture("uDepthMap", this._fboShadow.depthTexture, 0)
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uSeed", random())
      .draw();

    // const { centers } = this._systemRibbon;
    // console.log(centers);
    if (Config.debugAvoidCenters) {
      for (let i = 0; i < 2; i++) {
        let x = centers[i * 3];
        let y = centers[i * 3 + 1];
        let r = centers[i * 3 + 2];

        this._dBall.draw([x, y, 0], [r, r, r], [1, 1, 1], 0.1);
      }
    }

    // g = 512;
    // GL.viewport(0, 0, g, g);
    // this._dCopy.draw(this._fboPosRibbon.texture);
  }

  resize() {
    if (!GL.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1.5;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);
    }

    console.log(GL.aspectRatio, 9 / 16);
  }
}

export default SceneApp;
