import { GL, Draw, Mesh, CameraOrtho, FrameBuffer, DrawCopy } from "alfrid";
import { iOS, mix, random, biasMatrix } from "./utils";
import { vec3, mat4 } from "gl-matrix";
import Config from "./Config";

import vs from "shaders/staticFace.vert";
import fs from "shaders/staticFace.frag";

const NUM_FACES = 5;

export default class StaticFaceParticle {
  constructor() {
    this._drawCopy = new DrawCopy();
    this._draw = new Draw()
      .setMesh(this.generateParticles())
      .useProgram(vs, fs);

    // init camera for light
    this.camera = new CameraOrtho();
    let r = 4;
    this.camera.ortho(-r, r, r, -r, 1, 12);
    this.mtxShadow = mat4.create();

    // shadow map
    const fboSize = 1024;
    this._fboShadow = new FrameBuffer(fboSize, fboSize);

    this._fboBlack = new FrameBuffer(4, 4);
    this._fboBlack.bind();
    GL.clear(0, 0, 0, 1);
    this._fboBlack.unbind();

    const { numParticles: num } = Config;
    const type = iOS ? GL.HALF_FLOAT : GL.FLOAT;
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type,
    };
    this._faces = [];
    for (let i = 0; i < NUM_FACES; i++) {
      const fbo = new FrameBuffer(num, num, oSettings);
      fbo.bind();
      GL.clear(0, 0, 0, 1);
      fbo.unbind();
      this._faces.push({
        fbo,
        dir: [0, 0, 0],
        center: [0, 0, 0],
        translate: [0, 0, 0],
        updated: false,
      });
    }
    // this.scales = this._faces.map(() => Math.pow(random(1, 1.1), 2));
    this.scales = this._faces.map(() => random(1, 3));

    r = 0.25;
    this.offsets = this.scales.map(() => [random(-r, r), random(-r, r), 0]);
  }

  generateParticles() {
    const num = 192;
    const positions = [];
    const uvs = [];
    const indices = [];

    let r, a;
    const { sin, cos, PI } = Math;
    const getUV = () => {
      a = random(PI * 2);
      r = random(0.5);
      return [cos(a) * r + 0.5, sin(a) * r + 0.5];
    };

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        positions.push([random(), random(), random()]);
        uvs.push(getUV());
        indices.push(j * num + i);
      }
    }

    return new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);
  }

  update(mPosMap, mPointNose, mDir) {
    const face = this._faces.shift();
    const { fbo, dir, center } = face;

    fbo.bind();
    GL.clear(0, 0, 0, 1);
    this._drawCopy.draw(mPosMap);
    fbo.unbind();
    vec3.copy(center, mPointNose);
    vec3.copy(dir, mDir);
    face.updated = true;

    this._faces.push(face);
  }

  render(mCamera) {
    this._faces.forEach(({ fbo, dir, center }, i) => {
      this.renderFace(fbo.texture, center, dir, mCamera, i);
    });
  }

  renderFace(mPosMap, mPointNose, mDir, mCamera, mIndex) {
    // update camera
    const dir = vec3.clone(mDir);
    vec3.normalize(dir, dir);
    vec3.scale(dir, dir, 2);
    dir[1] += 5;
    vec3.add(dir, dir, mPointNose);
    this.camera.lookAt(dir, mPointNose, [0, 1, 0]);

    // update shadow map
    mat4.copy(this.mtxShadow, this.camera.matrix);
    mat4.mul(this.mtxShadow, biasMatrix, this.mtxShadow);
    const mtxModel = mat4.create();

    // this._fboShadow.bind();
    // GL.clear(0, 0, 0, 1);
    // GL.setMatrices(this.camera);
    // this._draw
    //   .bindTexture("uPosMap", mPosMap, 0)
    //   .bindTexture("uDepthMap", this._fboBlack.texture, 1)
    //   .uniform("uViewport", [GL.width, GL.height])
    //   .uniform("uShadowMatrix", this.mtxShadow)
    //   .uniform("uLocalMatrix", mtxModel)
    //   .draw();
    // this._fboShadow.unbind();

    const p = (mIndex + 0.5) / NUM_FACES;

    const c = vec3.clone(mPointNose);
    vec3.scale(c, c, -0.5);
    mat4.translate(mtxModel, mtxModel, c);

    let r = 1.0;
    mat4.rotateY(mtxModel, mtxModel, mix(r, -r, p));

    r = this.scales[mIndex] * 0.5;
    mat4.scale(mtxModel, mtxModel, [r, r, r]);
    mat4.translate(mtxModel, mtxModel, this.offsets[mIndex]);

    r = 7;
    mat4.translate(mtxModel, mtxModel, [mix(-r, r, p), 0, -4]);

    GL.setMatrices(mCamera);
    this._draw
      .bindTexture("uPosMap", mPosMap, 0)
      // .bindTexture("uDepthMap", this._fboShadow.depthTexture, 1)
      .uniform("uViewport", [GL.width, GL.height])
      .uniform("uShadowMatrix", this.mtxShadow)
      .uniform("uLocalMatrix", mtxModel)
      .uniform("uOffset", random())
      .draw();
  }
}
