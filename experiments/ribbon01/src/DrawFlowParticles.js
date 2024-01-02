import { GL, Mesh, Draw } from "alfrid";
import { random } from "./utils";
import vs from "shaders/flow.vert";
import fs from "shaders/flow.frag";

export default class DrawFlowParticles extends Draw {
  constructor() {
    super();

    const positions = [];
    const extras = [];
    const indices = [];
    let num = 500;

    const bound = 10;

    while (num--) {
      positions.push([
        random(-bound, bound),
        random(-bound, bound),
        random(-bound, bound) * 0.5,
      ]);
      extras.push([random(), random(), random()]);
      indices.push(num);
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferNormal(extras)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs).uniform("uBound", bound);
  }
}
