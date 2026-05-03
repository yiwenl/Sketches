import { GL, Draw, Mesh } from "@alfrid";

import MapConstants from "./MapConstants";
import Config from "./Config";
import { random } from "@utils";

import vs from "./shaders/save.vert";
import fs from "./shaders/save.frag";

export default class DrawSave extends Draw {
  constructor() {
    super();

    const { numDroplets: num } = Config;
    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    const { MAP_SIZE } = MapConstants;

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        // position
        let x = random(-MAP_SIZE, MAP_SIZE);
        let z = random(-MAP_SIZE, MAP_SIZE);
        // direction
        let vx = 0;
        let vy = 0;
        // water volume
        let volume = random(0.5, 1);
        // sediment volume
        let sediment = 0;

        let u = (i / num) * 2 - 1 + 0.5 / num;
        let v = (j / num) * 2 - 1 + 0.5 / num;

        positions.push([x, z, volume]);
        uvs.push([u, v]);
        normals.push([vx, vy, sediment]);

        indices.push(j * num + i);
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs).setClearColor(0, 0, 0, 1);
  }
}
