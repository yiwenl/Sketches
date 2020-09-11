import alfrid, { GL } from "alfrid";

import Config from "./Config";
import { getRandomElement } from "randomutils";
import vs from "shaders/trails.vert";
import fs from "shaders/traisl.frag";

class DrawTrails extends alfrid.Draw {
  constructor(theme) {
    super();

    const { trailLength, numParticles: num } = Config;
    const numSides = 4;

    const positions = [];
    const uvs = [];
    const indices = [];
    let count = 0;

    for (let i = 0; i < trailLength; i++) {
      for (let j = 0; j < numSides; j++) {
        positions.push([i, j, 0]);
        positions.push([i + 1, j, 0]);
        positions.push([i + 1, j + 1, 0]);
        positions.push([i, j + 1, 0]);

        uvs.push([i / trailLength, j / numSides]);
        uvs.push([(i + 1) / trailLength, j / numSides]);
        uvs.push([(i + 1) / trailLength, (j + 1) / numSides]);
        uvs.push([i / trailLength, (j + 1) / numSides]);

        indices.push(count * 4 + 0);
        indices.push(count * 4 + 1);
        indices.push(count * 4 + 2);
        indices.push(count * 4 + 0);
        indices.push(count * 4 + 2);
        indices.push(count * 4 + 3);

        count++;
      }
    }

    const mesh = new alfrid.Mesh();
    mesh.bufferVertex(positions);
    mesh.bufferTexCoord(uvs);
    mesh.bufferIndex(indices);

    // instancing
    const uvOffsets = [];
    const colors = [];

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        uvOffsets.push([i / num, j / num]);
        colors.push([Math.random(), Math.random(), Math.random()]);
      }
    }

    mesh.bufferInstance(uvOffsets, "aUVOffset");
    mesh.bufferInstance(colors, "aColor");

    this.setMesh(mesh).useProgram(vs, fs);

    // colors
    const colorUniforms = theme.reduce((c, total) => {
      total = total.concat(c);
      return total;
    }, []);

    this.uniform("uColors", "vec3", colorUniforms);
  }
}

export default DrawTrails;
