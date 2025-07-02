import {
  GL,
  GLShader,
  Draw,
  Geom,
  DrawAxis,
  DrawBall,
  DrawCopy,
  DrawCamera,
  Scene,
  CameraOrtho,
  FrameBuffer,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { toGlsl, biasMatrix } from "./utils";
import Config from "./Config";
import Assets from "./Assets";
import { mat4, vec3 } from "gl-matrix";
import { random, randomGaussian } from "./utils";
import UniformBufferObject from "./UniformBufferObject";
import Scheduler from "scheduling";

import DrawCompose from "./DrawCompose";
import DrawCubes from "./DrawCubes";

import vsDots from "shaders/dots1.vert";
import fsDots from "shaders/dots1.frag";

import vs from "shaders/uboParticles.vert";
import fs from "shaders/uboParticles.frag";

import vsFeedback from "shaders/feedback1.vert";

import TransformFeedback from "./TransformFeedback";

const COUNT = Math.pow(256 / 2, 2);

class SceneApp extends Scene {
  constructor() {
    super();

    console.log("COUNT", COUNT);

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    this.orbitalControl.radius.setTo(25);

    this.frame = 0;
    this._initParticles();
    this._initBuffers();

    this._updateParticles();
    window.addEventListener("keydown", (e) => {
      if (e.key === " ") {
        this._updateParticles();
      }
    });
  }

  _init() {
    this.orbitalControl.update();
    this.modelMatrix = mat4.create();
    this.resize();

    const { byteLength } = this.modelMatrix;
    this.uboTransform = new UniformBufferObject("Transform", byteLength * 3, 0);

    const { view, projection } = this.camera;
    this.uboTransform.updateData(0, this.modelMatrix);
    this.uboTransform.updateData(byteLength, view);
    this.uboTransform.updateData(byteLength * 2, projection);

    // shadow
    this._light = [1, 10, 5];
    this._cameraLight = new CameraOrtho();
    let r = 11;
    this._cameraLight.ortho(-r, r, r, -r, 1, 22);
    this._cameraLight.lookAt(this._light, [0, 0, 0]);

    this._mtxShadow = mat4.multiply([], biasMatrix, this._cameraLight.matrix);
  }

  _initParticles() {
    this._particles = [];

    for (let i = 0; i < COUNT; i++) {
      const pos = vec3.random([], Math.pow(random(1.5), 2));
      const position = [...pos, 1];
      const posOrg = [...pos, 1];
      const color = [random(), random(), random(), 1];
      const velocity = [0, 0, 0, 1];
      const randoms = [randomGaussian(), randomGaussian(), randomGaussian(), 1];
      const speed = randomGaussian(0.5, 2);
      const scale = randomGaussian(0.5, 2);
      const life = random();
      const lifeDecay = random(0.5, 0.1);
      this._particles.push({
        position,
        velocity,
        color,
        randoms,
        posOrg,
        extras: [speed, scale, life, lifeDecay],
      });
    }
  }

  _initBuffers() {
    this._transformFeedback = new TransformFeedback(
      this._particles,
      vsFeedback
    );
    const { read } = this._transformFeedback;

    this.uboParticles = new UniformBufferObject("Particles", read, 1);
    this.drawParticles.bindUniformBuffer(this.uboParticles);
  }

  _initTextures() {
    const s = 2048;
    this._fboShadow = new FrameBuffer(s, s);
    const fboBlack = new FrameBuffer(2, 2);
    fboBlack.bind();
    GL.clear(0, 0, 0, 1);
    fboBlack.unbind();
    this._textureBlack = fboBlack.texture;

    const oSettings = {
      type: GL.FLOAT,
    };

    this._fboRender = new FrameBuffer(GL.width, GL.height, oSettings, 4);
    this._fboMap = new FrameBuffer(GL.width, GL.height, oSettings);
  }

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();
    this._dCamera = new DrawCamera();
    this._dCompose = new DrawCompose();
    this._dCubes = new DrawCubes();

    this.shaderDots = new GLShader(vsDots, fsDots);

    let s = 0.05;
    const mesh = Geom.cube(s, s, s);
    let numInstances = COUNT;
    const aOffsets = [];
    while (numInstances--) {
      aOffsets.push([numInstances, random(), random()]);
    }
    mesh.bufferInstance(aOffsets, "aOffset");

    const _vs = vs.replace("${NUM_PARTICLES}", COUNT);
    this.drawParticles = new Draw()
      .setMesh(mesh)
      .useProgram(_vs, fs)
      .bindUniformBuffer(this.uboTransform);
  }

  update() {
    const { byteLength } = this.modelMatrix;
    this._updateParticles();

    // update shadow map
    this.uboTransform.updateData(byteLength, this._cameraLight.view);
    this.uboTransform.updateData(byteLength * 2, this._cameraLight.projection);

    this._fboShadow.bind();
    GL.clear(0, 0, 0, 0);
    GL.setMatrices(this._cameraLight);
    this._renderParticles(false);
    this._fboShadow.unbind();

    // update main scene
    const { view, projection } = this.camera;
    this.uboTransform.updateData(byteLength, view);
    this.uboTransform.updateData(byteLength * 2, projection);

    this._fboMap.bind();
    GL.setMatrices(this.camera);
    GL.clear(0, 0, 0, 0);
    GL.enableAdditiveBlending();
    GL.disable(GL.DEPTH_TEST);
    this._dCubes.uniform("uRotation", this.orbitalControl.ry.value).draw();
    this._fboMap.unbind();
    GL.enableAlphaBlending();
    GL.enable(GL.DEPTH_TEST);
  }

  _updateParticles() {
    // apply transform feedback
    this._transformFeedback
      .uniform("uTime", Scheduler.getTime() * 0.001)
      .draw();

    // setup uniform buffer object
    this.uboParticles.setBuffer(this._transformFeedback.read);
  }

  _renderParticles(mShadow) {
    const tDepth = mShadow ? this._fboShadow.depthTexture : this._textureBlack;
    this.drawParticles
      .bindTexture("uDepthMap", tDepth, 0)
      .uniform("uShadowMatrix", this._mtxShadow)
      .uniform("uLight", this._light)
      .draw();
  }

  render() {
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    // this._dAxis.draw();
    this._dCamera.draw(this._cameraLight);

    this._fboRender.bind();
    GL.clear(0, 0, 0, 0);
    this._renderParticles(true);
    this._fboRender.unbind();

    // this._dCubes.draw();

    // this._dCopy.draw(this._fboRender.getTexture(2));
    // this._dCopy.draw(this._fboMap.texture);

    this._dCompose
      .bindTexture("uPosMap", this._fboRender.getTexture(0), 0)
      .bindTexture("uNormalMap", this._fboRender.getTexture(1), 1)
      .bindTexture("uRandomMap", this._fboRender.getTexture(2), 2)
      .bindTexture("uLightMap", this._fboRender.getTexture(3), 3)
      .bindTexture("uMap", this._fboMap.texture, 4)
      .bindTexture("uColorMap0", Assets.get("color0"), 5)
      .bindTexture("uColorMap1", Assets.get("color1"), 6)
      .bindTexture("uColorMap2", Assets.get("color2"), 7)
      .bindTexture("uColorMap3", Assets.get("color3"), 8)
      .draw();
  }

  resize() {
    if (!Config.useTargetSize) {
      const { innerWidth, innerHeight } = window;
      const pixelRatio = 1.5;
      GL.setSize(innerWidth * pixelRatio, innerHeight * pixelRatio);
      this.camera?.setAspectRatio(GL.aspectRatio);

      const { projection } = this.camera;
      const { byteLength } = projection;
      this.uboTransform?.updateData(byteLength * 2, projection);
    }
  }
}

export default SceneApp;
