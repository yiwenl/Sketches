import { GL, DrawBall, Draw, Geom, DrawAxis, DrawCopy, Scene } from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { toGlsl } from "./utils";
import Config from "./Config";
import { mat4, vec3 } from "gl-matrix";
import { random } from "./utils";
import UniformBufferObject from "./UniformBufferObject";

import vs from "shaders/uboArray.vert";
import fs from "shaders/uboArray.frag";

const COUNT = 50000;

class SceneApp extends Scene {
  constructor() {
    super();

    console.log("COUNT", COUNT);

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    this.orbitalControl.radius.setTo(10);

    this.frame = 0;
    this._initParticles();
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
  }

  _initParticles() {
    const { gl } = GL;
    const range = 2;
    const particleData = new Float32Array(COUNT * 4 * 2);
    for (let i = 0; i < COUNT; i++) {
      const s = i * 4 * 2;
      const p = vec3.random([], random(range));

      const r = random();
      const g = random();
      const b = random();

      particleData[s] = p[0];
      particleData[s + 1] = p[1];
      particleData[s + 2] = p[2];
      particleData[s + 3] = random(0.5, 2);

      particleData[s + 4] = r;
      particleData[s + 5] = g;
      particleData[s + 6] = b;
      particleData[s + 7] = 1;
    }

    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
    gl.bufferData(gl.UNIFORM_BUFFER, particleData, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    this.uboParticles = new UniformBufferObject("Particles", particleData, 1);
    this.drawParticles.bindUniformBuffer(this.uboParticles);
  }

  _initTextures() {}

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();

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
    const { view } = this.camera;
    this.uboTransform.updateData(byteLength, view);
  }

  render() {
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();
    this.drawParticles.draw();
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
