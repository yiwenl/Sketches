import alfrid, { GL } from "alfrid";
import Config from "./Config";
import { random } from "randomutils";
import vs from "shaders/save.vert";
import fs from "shaders/save.frag";

class DrawSave extends alfrid.Draw {
  constructor() {
    super();

    const { numParticles: num, planeSize } = Config;
    const s = planeSize / 2;

    const positions = [];
    const uvs = [];
    const normals = [];
    const extra = [];
    const indices = [];

    let index = 0;
    const z = 0.01;
    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        positions.push([random(-s, s), random(-s / 2, s / 2), random(-z, z)]);
        uvs.push([(i / num) * 2 - 1, (j / num) * 2 - 1]);
        normals.push([Math.random(), Math.random(), Math.random()]);
        extra.push([0, 0, Math.random()]);
        indices.push(index);

        index++;
      }
    }

    const mesh = new alfrid.Mesh(GL.POINTS);
    mesh
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices)
      .bufferNormal(normals)
      .bufferData(extra, "aExtra");

    this.setMesh(mesh)
      .useProgram(vs, fs)
      .setClearColor(0, 0, 0, 0);
  }
}

export default DrawSave;
