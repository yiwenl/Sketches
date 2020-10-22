import alfrid, { GL } from "alfrid";
import fs from "shaders/moving-blocks.frag";

class TextureBlocks extends alfrid.FrameBuffer {
  constructor() {
    const fboSize = 256;
    super(fboSize, fboSize, {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    });

    this._draw = new alfrid.Draw()
      .setMesh(alfrid.Geom.bigTriangle())
      .useProgram(alfrid.ShaderLibs.bigTriangleVert, fs)
      .bindFrameBuffer(this)
      .setClearColor(0, 0, 0, 0)
      .uniform("uNum", "float", 16)
      .uniform("uEase", "float", 0.0);
  }

  update() {
    this._draw.uniform("uTime", "float", alfrid.Scheduler.deltaTime).draw();
  }
}

export default TextureBlocks;
