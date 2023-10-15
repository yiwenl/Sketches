import { Draw } from "./Draw";
import vs from "../shader/glsl/dots.vert";
import fs from "../shader/glsl/simpleColor.frag";

class DrawDotsPlane extends Draw {
  constructor(mGL) {
    super(mGL);

    const GL = this._GL;

    const positions = [];
    const indices = [];
    let index = 0;
    const size = 100;
    let i, j;

    for (i = -size; i < size; i += 1) {
      for (j = -size; j < size; j += 1) {
        positions.push([i, j, 0]);
        indices.push(index);
        index++;

        positions.push([i, 0, j]);
        indices.push(index);
        index++;
      }
    }

    this.createMesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferIndex(indices)
      .useProgram(vs, fs);

    this.color = [1, 1, 1];
    this.opacity = 0.5;
    this.pointScale = 1;
    this.scale = 1;
  }

  draw() {
    const { width, height } = this._GL;
    this.uniform("uColor", this.color)
      .uniform("uOpacity", this.opacity)
      .uniform("uScale", this.scale)
      .uniform("uPointScale", this.pointScale)
      .uniform("uViewport", [width, height]);
    super.draw();
  }
}

export { DrawDotsPlane };
