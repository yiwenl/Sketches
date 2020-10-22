import alfrid, { GL } from "alfrid";
import Config from "./Config";

import { random } from "randomutils";

import vs from "shaders/floating-chars.vert";
import fs from "shaders/floating-chars.frag";

class DrawFloatingChars extends alfrid.Draw {
  constructor() {
    super();

    const { numFloatingChars: num } = Config;
    const positions = [];
    const uvs = [];
    const indices = [];
    const normals = [];

    let count = 0;

    const getPos = () => {
      const r = 3;
      return [random(-r, r), random(-r, r), random(-r, r)];
    };

    for (let i = 0; i < num; i++) {
      let u = Math.floor(Math.random() * 12) / 12;
      let v = Math.floor(Math.random() * 12) / 12;

      positions.push(getPos());
      uvs.push([u, v]);
      normals.push([Math.random(), Math.random(), Math.random()]);
      indices.push(count);
      count++;
    }

    const mesh = new alfrid.Mesh(GL.POINTS);
    mesh
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}

export default DrawFloatingChars;
