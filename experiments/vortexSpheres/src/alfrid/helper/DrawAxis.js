import { Draw } from "./Draw";
import vs from "../shader/glsl/axis.vert";
import fs from "../shader/glsl/axis.frag";

class DrawAxis extends Draw {
  constructor(mGL) {
    super(mGL);

    const GL = this._GL;
    const r = 1000;
    const positions = [
      [-r, 0, 0],
      [r, 0, 0],
      [0, -r, 0],
      [0, r, 0],
      [0, 0, -r],
      [0, 0, r],
    ];
    const colors = [
      [1, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
      [0, 1, 0],
      [0, 0, 1],
      [0, 0, 1],
    ];

    const indices = [0, 1, 2, 3, 4, 5];
    this.createMesh(GL.LINES)
      .bufferVertex(positions)
      .bufferData(colors, "aColor")
      .bufferIndex(indices)
      .useProgram(vs, fs);

    this.opacity = 0.75;
  }

  draw() {
    this.uniform("uOpacity", this.opacity);
    super.draw();
  }
}

export { DrawAxis };
