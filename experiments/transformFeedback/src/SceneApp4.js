import {
  GL,
  GLShader,
  DrawBall,
  Draw,
  Geom,
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
import Scheduler from "scheduling";

import vsDots from "shaders/dots1.vert";
import fsDots from "shaders/dots1.frag";

import vs from "shaders/uboParticles.vert";
import fs from "shaders/uboParticles.frag";

import vsFeedback from "shaders/feedback1.vert";
import fsFeedback from "shaders/feedback1.frag";

const COUNT = Math.pow(512, 2);

class SceneApp extends Scene {
  constructor() {
    super();

    console.log("COUNT", COUNT);

    if (Config.useTargetSize) {
      GL.setSize(targetWidth, targetHeight);
      this.camera.setAspectRatio(GL.aspectRatio);
      resize(GL.canvas, targetWidth, targetHeight);
    }

    this.orbitalControl.radius.setTo(20);

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
  }

  _initParticles() {
    this._particles = [];

    for (let i = 0; i < COUNT; i++) {
      const pos = vec3.random([], Math.pow(random(2), 2));
      const color = [random(), random(), random()];
      const vel = [0, 0, 0];
      const randoms = [random(), random(), random()];
      const speed = random(0.5, 2);
      const scale = random(0.5, 2);
      const life = random();
      const lifeDecay = random(0.5, 0.1);
      this._particles.push({
        pos,
        vel,
        randoms,
        color,
        speed,
        scale,
        life,
        lifeDecay,
      });
    }
    console.table(this._particles[0]);
  }

  _initBuffers() {
    this.fields = [
      "position",
      "velocity",
      "color",
      "randoms",
      "posOrg",
      "extras", // [speed, scale, life, lifeDecay]
    ];

    const sizeOfFloat = 4;
    this.fieldMap = [];
    let numbersCount = 0;
    this.fields.forEach((f) => {
      const length = 4;
      numbersCount += length;
      this.fieldMap.push({ name: f, length });
    });
    const stride = numbersCount * 4;

    console.table(this.fieldMap);

    // create particle buffer
    const { gl } = GL;
    const numFields = this.fields.length * 4;
    const particleData = new Float32Array(COUNT * numFields);
    this._particles.forEach((p, i) => {
      const s = i * numFields;
      particleData[s] = p.pos[0];
      particleData[s + 1] = p.pos[1];
      particleData[s + 2] = p.pos[2];
      particleData[s + 3] = 1;

      particleData[s + 4] = p.vel[0];
      particleData[s + 5] = p.vel[1];
      particleData[s + 6] = p.vel[2];
      particleData[s + 7] = 1;

      particleData[s + 8] = p.color[0];
      particleData[s + 9] = p.color[1];
      particleData[s + 10] = p.color[2];
      particleData[s + 11] = 1;

      particleData[s + 12] = p.randoms[0];
      particleData[s + 13] = p.randoms[1];
      particleData[s + 14] = p.randoms[2];
      particleData[s + 15] = 1;

      particleData[s + 16] = p.pos[0];
      particleData[s + 17] = p.pos[1];
      particleData[s + 18] = p.pos[2];
      particleData[s + 19] = 1;

      particleData[s + 20] = p.speed;
      particleData[s + 21] = p.scale;
      particleData[s + 22] = p.life;
      particleData[s + 23] = p.lifeDecay;
    });
    this.particleData = particleData;

    // this.uboParticles = new UniformBufferObject("Particles", particleData, 1);
    // this.drawParticles.bindUniformBuffer(this.uboParticles);

    // create vaos for transform feedback
    this.buffer1 = gl.createBuffer();
    this.vao1 = gl.createVertexArray();

    let k = 0;
    const targetUsage = gl.ARRAY_BUFFER;
    gl.bindVertexArray(this.vao1);
    gl.bindBuffer(targetUsage, this.buffer1);
    gl.bufferData(targetUsage, particleData, gl.DYNAMIC_READ);
    this.fieldMap.forEach(({ length }, i) => {
      gl.vertexAttribPointer(i, length, gl.FLOAT, false, stride, k);
      gl.enableVertexAttribArray(i);
      k += length * sizeOfFloat;
    });

    k = 0;
    const { byteLength } = particleData;
    this.buffer2 = gl.createBuffer();
    this.vao2 = gl.createVertexArray();
    gl.bindVertexArray(this.vao2);
    gl.bindBuffer(targetUsage, this.buffer2);
    gl.bufferData(targetUsage, byteLength, gl.DYNAMIC_READ);
    this.fieldMap.forEach(({ length }, i) => {
      gl.vertexAttribPointer(i, length, gl.FLOAT, false, stride, k);
      gl.enableVertexAttribArray(i);
      k += length * sizeOfFloat;
    });

    // unbind buffer
    gl.bindVertexArray(null);
    gl.bindBuffer(targetUsage, null);

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
      "oExtras",
    ];
    gl.transformFeedbackVaryings(program, varyings, gl.INTERLEAVED_ATTRIBS);
    gl.linkProgram(program);

    this.vao = this.vao1;
    this.buffer = this.buffer2;
  }

  _initTextures() {}

  _initViews() {
    this._dAxis = new DrawAxis();
    this._dCopy = new DrawCopy();
    this._dBall = new DrawBall();

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
    const { view } = this.camera;
    this.uboTransform.updateData(byteLength, view);
    this._updateParticles();
  }

  _updateParticles() {
    // console.log("Update Particles");
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

    // ping pong buffers
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

    const { gl } = GL;
    const buffer = this.buffer === this.buffer1 ? this.buffer2 : this.buffer1;

    this.drawParticles.shader.bind();
    const { shaderProgram: program } = this.drawParticles.shader;
    const blockIndex = gl.getUniformBlockIndex(program, "Particles");
    const bindingPoint = 1;
    gl.uniformBlockBinding(program, blockIndex, bindingPoint);
    gl.bindBufferBase(gl.UNIFORM_BUFFER, bindingPoint, buffer);
    this.uboTransform.bind();
    GL.draw(this.drawParticles._mesh);

    // this.drawDots();
  }

  drawDots() {
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

      const { projection } = this.camera;
      const { byteLength } = projection;
      this.uboTransform?.updateData(byteLength * 2, projection);
    }
  }
}

export default SceneApp;
