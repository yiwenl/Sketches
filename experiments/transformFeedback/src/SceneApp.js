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
import UniformBufferObject from "./UniformBufferObject";
import { random } from "./utils";
import Scheduler from "scheduling";

import vs from "shaders/ubo.vert";
import fs from "shaders/ubo.frag";

import vsFeedback from "shaders/feedback.vert";
import fsFeedback from "shaders/feedback.frag";

import vsDots from "shaders/dots.vert";
import fsDots from "shaders/dots.frag";

const COUNT = Math.pow(256, 2);

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

    this.setupTransform();
    this.frame = 0;
  }

  setupTransform() {
    const { gl } = GL;

    const particles = [];
    const r = 2;
    for (let i = 0; i < COUNT; i++) {
      const pos = vec3.random([], random(r));
      particles.push({
        pos: pos,
        posOrg: pos,
        color: [random(), random(), random()],
        vel: [0, 0, 0],
        randoms: [random(), random(), random()],
        scale: random(0.5, 2),
        speed: random(0.5, 2),
        life: random(),
        lifeDecay: random(0.5, 0.2),
      });
    }

    const p = particles[0];
    const fields = [
      "pos",
      "vel",
      "color",
      "randoms",
      "posOrg",
      "speed",
      "scale",
      "life",
      "lifeDecay",
    ];
    const fieldMap = [];
    let numbersCount = 0;
    fields.forEach((f) => {
      const length = p[f].length || 1;
      numbersCount += length;
      fieldMap.push({ name: f, length });
    });

    console.table(fieldMap);
    const stride = numbersCount * 4;

    const initialData = new Float32Array(COUNT * numbersCount);
    for (let i = 0; i < COUNT; i++) {
      const start = i * numbersCount;
      const p = particles[i];
      let k = 0;
      fields.forEach((f) => {
        const value = p[f];
        if (value.length !== undefined) {
          for (let l = 0; l < value.length; l++) {
            initialData[k++ + start] = value[l];
          }
        } else {
          initialData[k++ + start] = value;
        }
      });
    }
    const { byteLength } = initialData;

    this.buffer1 = gl.createBuffer();
    this.vao1 = gl.createVertexArray();
    const sizeOfFloat = 4;

    let k = 0;
    gl.bindVertexArray(this.vao1);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer1);
    gl.bufferData(gl.ARRAY_BUFFER, initialData, gl.DYNAMIC_READ);
    fieldMap.forEach(({ length }, i) => {
      gl.vertexAttribPointer(i, length, gl.FLOAT, false, stride, k);
      gl.enableVertexAttribArray(i);
      k += length * sizeOfFloat;
    });

    k = 0;
    this.buffer2 = gl.createBuffer();
    this.vao2 = gl.createVertexArray();
    gl.bindVertexArray(this.vao2);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer2);
    gl.bufferData(gl.ARRAY_BUFFER, byteLength, gl.DYNAMIC_READ);
    fieldMap.forEach(({ length }, i) => {
      console.log(
        `gl.vertexAttribPointer(${i}, ${length}, gl.FLOAT, false, stride, ${k});`
      );
      gl.vertexAttribPointer(i, length, gl.FLOAT, false, stride, k);
      gl.enableVertexAttribArray(i);
      k += length * sizeOfFloat;
    });

    // unbind buffer
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // create shader
    this.shaderTransform = new GLShader(vsFeedback, fsFeedback);
    this.shaderTransform.bind();
    const { shaderProgram: program } = this.shaderTransform;

    const varyings = [
      "oPosition",
      "oVelocity",
      "oColor",
      "oRandoms",
      "oPosOrg",
      "oSpeed",
      "oScale",
      "oLife",
      "oLifeDecay",
    ];
    gl.transformFeedbackVaryings(program, varyings, gl.INTERLEAVED_ATTRIBS);
    gl.linkProgram(program);

    this.vao = this.vao1;
    this.buffer = this.buffer2;
    this._createDotsDrawCall();
  }

  _init() {
    this.orbitalControl.update();
    this.modelMatrix = mat4.create();
    this.resize();
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
    this.draw = new Draw()
      .setMesh(Geom.plane(s, s, 1))
      .useProgram(vs, fs)
      .bindUniformBuffer(this.uboTransform);

    s = 0.5;
    this.draw2 = new Draw()
      .setMesh(Geom.sphere(s, 12))
      .useProgram(vs, fs)
      .bindUniformBuffer(this.uboTransform);
  }

  update() {
    const { byteLength } = this.modelMatrix;
    const { view } = this.camera;
    this.uboTransform.updateData(byteLength, view);

    const { gl } = GL;

    this.shaderTransform.bind();
    this.shaderTransform.uniform("uTime", Scheduler.getTime() * 0.001);
    this.shaderTransform.updateUniforms();

    GL.enable(GL.RASTERIZER_DISCARD);

    gl.bindVertexArray(this.vao);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.buffer);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, COUNT);
    gl.endTransformFeedback();

    if (this.vao === this.vao1) {
      this.vao = this.vao2;
      this.buffer = this.buffer1;
    } else {
      this.vao = this.vao1;
      this.buffer = this.buffer2;
    }

    this.vaoFinal = this.buffer === this.buffer1 ? this.vao1 : this.vao2;

    // unbind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

    GL.disable(GL.RASTERIZER_DISCARD);
  }

  render() {
    let g = 0.1;
    GL.clear(...Config.colorBg.map(toGlsl), 1);
    GL.setMatrices(this.camera);

    this._dAxis.draw();

    if (this.vaoFinal) {
      const { view, projection } = this.camera;
      const { gl } = GL;
      this.shaderDots.bind();
      this.shaderDots.uniform("uProjectionMatrix", "mat4", projection);
      this.shaderDots.uniform("uViewMatrix", "mat4", view);
      this.shaderDots.uniform("uModelMatrix", "mat4", this.modelMatrix);
      this.shaderDots.uniform("uViewport", [GL.width, GL.height]);
      this.shaderDots.updateUniforms();
      // this.shaderDots.bind();
      GL.useShader(this.shaderDots);

      gl.bindVertexArray(this.vaoFinal);
      gl.drawArrays(gl.POINTS, 0, COUNT);
      gl.bindVertexArray(null);
    }
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
