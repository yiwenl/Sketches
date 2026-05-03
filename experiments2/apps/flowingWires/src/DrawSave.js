import { Draw, GL, Mesh } from "@alfrid";
import { random } from "@utils";
import Config from "./Config";
import vs from "./shaders/save.vert";
import fs from "./shaders/save.frag";

export default class DrawSave extends Draw {
  constructor() {
    super();

    const { numParticles: num } = Config;
    const positions = [];
    const uvs = [];
    const normals = [];

    const indices = [];

    const ratio = 2.5;
    const w = 10;
    const h = w / ratio;

    const { sin, cos, sqrt, PI } = Math;

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num - 1; j++) {
        const x = random(-w / 2, w / 2);

        const r = (sqrt(random()) * h) / 2;
        const theta = random(PI * 2);
        const y = r * sin(theta);
        const z = r * cos(theta);

        positions.push([x, y, z]);
        uvs.push((j / num) * 2 - 1 + 0.5 / num, (i / num) * 2 - 1 + 0.5 / num);
        normals.push([random(), random(), random()]);

        indices.push(i * num + j);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
