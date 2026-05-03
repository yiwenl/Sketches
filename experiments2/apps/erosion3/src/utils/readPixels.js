import { GL, Draw, Geom, ShaderLibs, DrawCopy, FrameBuffer } from "@alfrid";
let draw;
let drawDepth;

import fs from "../shaders/depth-read.frag";

export const readPixels = (mMap, mFloat = false) => {
  const type = mFloat ? GL.FLOAT : GL.UNSIGNED_BYTE;
  const fbo = new FrameBuffer(mMap.width, mMap.height, {
    type,
    minFilter: GL.LINEAR,
    magFilter: GL.LINEAR,
  });

  const pixels = mFloat
    ? new Float32Array(mMap.width * mMap.height * 4)
    : new Uint8Array(mMap.width * mMap.height * 4);
  if (!draw) {
    draw = new DrawCopy();
  }
  const { gl } = GL;

  fbo.bind();
  GL.clear(0, 0, 0, 0);
  draw.draw(mMap);

  // Reading depth :
  // const format = gl.DEPTH_COMPONENT;
  // const type = mFloat ? gl.FLOAT : gl.UNSIGNED_BYTE;
  // gl.readPixels(0, 0, width, height, format, type, pixels);

  gl.readPixels(0, 0, mMap.width, mMap.height, gl.RGBA, type, pixels);
  fbo.unbind();

  return pixels;
};

export const readDepthPixels = (mDepthMap) => {
  const { width, height } = mDepthMap;
  console.log(width, height);
  const pixels = new Float32Array(width * height * 4);
  const fbo = new FrameBuffer(width, height, {
    type: GL.FLOAT,
    minFilter: GL.LINEAR,
    magFilter: GL.LINEAR,
  });

  const { gl } = GL;

  if (!drawDepth) {
    drawDepth = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 0);
  }

  fbo.bind();
  drawDepth.bindTexture("uDepthMap", mDepthMap, 0).draw();
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.FLOAT, pixels);
  fbo.unbind();

  return pixels;
};
