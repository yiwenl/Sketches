import { GL, Draw, Geom, GLTexture, Object3D } from "alfrid";
import { createCanvas } from "./utils/setupProject2D";

import vs from "shaders/char.vert";
import fs from "shaders/char.frag";

const gap = 0.005;

export default class DrawChar extends Draw {
  constructor(mChar, mSize, mHeight) {
    super();

    let s = 256;
    const { canvas, ctx } = createCanvas(s, s);
    ctx.fillStyle = "white";
    ctx.font = `900 ${s}px Noto Serif TC`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(mChar, s / 2, s / 2);
    this.texture = new GLTexture(canvas);

    const mesh = Geom.plane(mSize, mSize, 1, "xz");

    const posOffsets = [];
    let num = mHeight / gap;
    for (let i = 0; i < num; i++) {
      posOffsets.push([0, i * gap + gap * 0.5, 0]);
    }

    mesh.bufferInstance(posOffsets, "aPosOffset");

    this.setMesh(mesh).useProgram(vs, fs).bindTexture("uMap", this.texture, 0);

    this.container = new Object3D();
  }

  draw() {
    GL.setModelMatrix(this.container.matrix);
    super.draw();
  }

  get x() {
    return this.container.x;
  }

  set x(mValue) {
    this.container.x = mValue;
  }

  get z() {
    return this.container.z;
  }

  set z(mValue) {
    this.container.z = mValue;
  }

  get scale() {
    return this.container.scaleX;
  }

  set scale(mValue) {
    this.container.scaleX =
      this.container.scaleY =
      this.container.scaleZ =
        mValue;
  }
}
