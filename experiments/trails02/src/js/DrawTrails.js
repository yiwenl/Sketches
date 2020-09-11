import alfrid, { GL } from "alfrid";

import Config from "./Config";
import Assets from "./Assets";
import { getRandomElement, randomFloor } from "randomutils";
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

    const { _source: source } = Assets.get("test");

    const cvs = document.createElement("canvas");
    cvs.width = source.width;
    cvs.height = source.height;
    const ctx = cvs.getContext("2d");
    ctx.drawImage(source, 0, 0);
    const imgData = ctx.getImageData(0, 0, source.width, source.height).data;

    const getRandomColor = () => {
      const x = randomFloor(source.width);
      const y = randomFloor(source.height);
      const index = (x + y * source.width) * 4;
      return [
        imgData[index] / 255,
        imgData[index + 1] / 255,
        imgData[index + 2] / 255,
      ];
    };

    const mesh = new alfrid.Mesh();
    mesh.bufferVertex(positions);
    mesh.bufferTexCoord(uvs);
    mesh.bufferIndex(indices);

    this.randomColor = getRandomColor();

    // instancing
    const uvOffsets = [];
    const extras = [];
    const colors = [];

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        uvOffsets.push([i / num, j / num]);
        extras.push([Math.random(), Math.random(), Math.random()]);
        colors.push(getRandomColor());
      }
    }

    mesh.bufferInstance(uvOffsets, "aUVOffset");
    mesh.bufferInstance(extras, "aExtra");
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
