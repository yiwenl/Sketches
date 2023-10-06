import { Mesh, GL, Draw } from "alfrid";
import { random } from "./utils";
import Scheduler from "scheduling";

import vs from "shaders/floating.vert";
import fs from "shaders/floating.frag";

export default class DrawFloatingParticles extends Draw {
  constructor() {
    super();

    let num = 1000;
    const r = 10;
    const getPos = () => [random(-r, r), random(-r, r), random(-r, r)];

    const positions = [];
    const uvs = [];
    const normals = [];
    const indices = [];

    while (num--) {
      positions.push(getPos());
      uvs.push([random(), random()]);
      normals.push([random(), random(), random()]);
      indices.push(num);
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }

  draw() {
    this.uniform("uTime", Scheduler.getElapsedTime());
    super.draw();
  }
}
