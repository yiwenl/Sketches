import {
  GL,
  DrawBall,
  Draw,
  Geom,
  GLShader,
  DrawAxis,
  DrawCopy,
  Scene,
} from "alfrid";
import { targetWidth, targetHeight } from "./features";
import resize from "./utils/resize";
import { toGlsl } from "./utils";
import Config from "./Config";
import { mat4, vec3 } from "gl-matrix";
import { random } from "./utils";
import UniformBufferObject from "./UniformBufferObject";

import vs from "shaders/uboArray.vert";
import fs from "shaders/uboArray.frag";

import vsDots from "shaders/dots.vert";
import fsDots from "shaders/dots.frag";

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
    this._initUboArray();
  }

  _init() {
    this.orbitalControl.update();
    this.modelMatrix = mat4.create();
    this.resize();
  }

  _initUboArray() {
    const { gl } = GL;
    // const sizeOfFloat = 4;
    // const blockSize = 4 * 2 * sizeOfFloat;
    // console.log("blockSize", blockSize);

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
  }

  _createDotsDrawCall() {
    console.log("Create dots draw call");
    this.shaderDots = new GLShader(vsDots, fsDots);
  }

  _initTextures() {}

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();

    // Get the uniform block index and bind it to a binding point
    const { byteLength } = this.modelMatrix;
    this.uboTransform = new UniformBufferObject("Transform", byteLength * 3, 0);

    const { view, projection } = this.camera;
    this.uboTransform.updateData(0, this.modelMatrix);
    this.uboTransform.updateData(byteLength, view);
    this.uboTransform.updateData(byteLength * 2, projection);

    let s = 2;
    // this.draw = new Draw()
    //   .setMesh(Geom.plane(s, s, 1))
    //   .useProgram(vs, fs)
    //   .bindUniformBuffer(this.uboTransform);

    s = 0.05;
    // const mesh = Geom.sphere(s, 6);
    const mesh = Geom.cube(s, s, s);
    let numInstances = COUNT;
    const aOffsets = [];
    while (numInstances--) {
      aOffsets.push([numInstances, random(), random()]);
    }
    mesh.bufferInstance(aOffsets, "aOffset");
    const _vs = vs.replace("${NUM_PARTICLES}", COUNT);
    this.draw2 = new Draw()
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
    // this.draw.draw();
    // this.draw2.draw();

    this.draw2.shader.bind();
    const { gl } = GL;
    const { shaderProgram: program } = this.draw2.shader;
    const blockIndexParticle = gl.getUniformBlockIndex(program, "Particles");
    // const blockIndexTransform = gl.getUniformBlockIndex(program, "Transform");
    gl.uniformBlockBinding(program, blockIndexParticle, 0);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, this.buffer);

    GL.draw(this.draw2._mesh);
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
