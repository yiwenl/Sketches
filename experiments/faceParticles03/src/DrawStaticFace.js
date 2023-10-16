import { GL, Draw, Mesh } from "alfrid";

import { random } from "./utils";

import vs from "shaders/staticFace.vert";
import fs from "shaders/staticFace.frag";

export default class DrawStaticFace extends Draw {
  constructor() {
    super();

    const positions = [];
    const uvs = [];
    const indices = [];

    let num = 250000;

    const { sin, cos, PI, pow } = Math;
    const getUV = () => {
      const r = pow(random(0.5), random(1, 1.3));
      const a = random(PI * 2);
      return [r * cos(a) + 0.5, r * sin(a) + 0.5];
    };

    while (num--) {
      let scale = random(0.5, 1.5);
      if (random() < 0.01) {
        scale *= random(1, 2);
      }
      positions.push([scale, random(), random()]);
      uvs.push(getUV());
      indices.push(num);
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
