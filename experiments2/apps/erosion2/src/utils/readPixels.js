import { GL, DrawCopy, FrameBuffer } from "@alfrid";
let draw;

export const readPixels = (mHeightMap) => {
  const fbo = new FrameBuffer(mHeightMap.width, mHeightMap.height, {
    minFilter: GL.LINEAR,
    magFilter: GL.LINEAR,
    type: GL.FLOAT,
  });
  const pixels = new Float32Array(mHeightMap.width * mHeightMap.height * 4);

  if (!draw) {
    draw = new DrawCopy();
  }
  const { gl } = GL;

  fbo.bind();
  GL.clear(0, 0, 0, 0);
  draw.draw(mHeightMap);

  gl.readPixels(
    0,
    0,
    mHeightMap.width,
    mHeightMap.height,
    gl.RGBA,
    gl.FLOAT,
    pixels
  );
  fbo.unbind();

  return pixels;
};
