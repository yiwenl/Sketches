import { Draw } from "./Draw";
import vs from "../shader/glsl/line.vert";
import fs from "../shader/glsl/simpleColor.frag";

class DrawLine extends Draw {
  constructor(mGL) {
    super(mGL);

    const GL = this._GL;
    const positions = [[0, 0, 0], [1, 0, 0]];

    const indices = [0, 1];
    this.createMesh(GL.LINES)
      .bufferVertex(positions)
      .bufferIndex(indices)
      .useProgram(vs, fs);

    this.color = [1, 1, 1];
    this.opacity = 0.75;
  }

  draw(mA, mB, mColor, mOpacity) {
    this.uniform("uPosA", mA)
      .uniform("uPosB", mB)
      .uniform("uOpacity", mOpacity || this.opacity)
      .uniform("uColor", mColor || this.color);
    super.draw();
  }
}

export { DrawLine };
