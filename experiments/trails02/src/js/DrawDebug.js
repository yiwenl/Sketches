import alfrid, { GL } from "alfrid";

import Config from "./Config";
import vs from "shaders/debugPoints.vert";
import fs from "shaders/debugPoints.frag";

class DrawDebug extends alfrid.Draw {
  constructor() {
    super();

    const { numParticles: num } = Config;

    const positions = [];
    const uvs = [];
    const indices = [];

    let count = 0;

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        positions.push([Math.random(), 0, 0]);
        uvs.push([i / num, j / num]);
        indices.push(count);

        count++;
      }
    }

    const mesh = new alfrid.Mesh(GL.POINTS);
    mesh.bufferVertex(positions);
    mesh.bufferTexCoord(uvs);
    mesh.bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}

export default DrawDebug;
