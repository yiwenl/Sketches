// index.js

import { GLTexture } from "alfrid";
import { mat4 } from "gl-matrix";

export { saveImage } from "./saveImage";
export { saveJson } from "./saveJson";
export { resize } from "./resizeCanavs";
export { getDateString } from "./getDateString";

export const getColorTexture = (mColor) => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 4;
  const ctx = canvas.getContext("2d");
  const c = mColor.map((v) => Math.floor(v * 255));
  ctx.fillStyle = `rgba(${c[0]}, ${c[1]}, ${c[2]}, 1)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  return new GLTexture(canvas);
};

export const map = (v, a, b, c, d) => {
  const p = (v - a) / (b - a);
  return c + p * (d - c);
};

export const clamp = (v, a, b) => {
  return Math.min(Math.max(v, a), b);
};

export const biasMatrix = mat4.fromValues(
  0.5,
  0.0,
  0.0,
  0.0,
  0.0,
  0.5,
  0.0,
  0.0,
  0.0,
  0.0,
  0.5,
  0.0,
  0.5,
  0.5,
  0.5,
  1.0
);
