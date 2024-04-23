import { Draw, Mesh } from "alfrid";
import { random } from "./utils";
import { vec3 } from "gl-matrix";

import vs from "shaders/trail2.vert";
import fs from "shaders/blocks.frag";

let numNodes = 600;
let numSeg = 3;

export default class DrawTrail2 extends Draw {
  constructor() {
    super();

    const positions = [];
    const uvs = [];
    const normals = [];
    const indices = [];

    let count = 0;
    // const r = random(0.01, 0.025);
    const r = 0.01;
    const { PI } = Math;

    const addVertex = (i, j) => {
      const p = [0, r, 0];
      const n = [0, 1, 0];
      const a = -(PI * 2 * j) / numSeg;
      vec3.rotateX(p, p, [0, 0, 0], a);
      vec3.rotateX(n, n, [0, 0, 0], a);

      positions.push(p);
      normals.push(n);
      uvs.push([i / numNodes, j / numSeg]);
    };

    for (let i = 0; i < numNodes - 2; i++) {
      for (let j = 0; j < numSeg; j++) {
        addVertex(i, j);
        addVertex(i + 1, j);
        addVertex(i + 1, j + 1);
        addVertex(i, j + 1);

        indices.push(count * 4 + 0);
        indices.push(count * 4 + 1);
        indices.push(count * 4 + 2);
        indices.push(count * 4 + 0);
        indices.push(count * 4 + 2);
        indices.push(count * 4 + 3);

        count++;
      }
    }

    const mesh = new Mesh()
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
    this.nodes = [];
    this.mesh = mesh;
  }

  reset(pos) {
    for (let i = 0; i < numNodes; i++) {
      this.nodes.push([pos[0], pos[1], pos[2]]);
    }
  }

  update(pos) {
    this.nodes.shift();
    this.nodes.push([pos[0], pos[1], pos[2]]);

    const currPos = [];
    const nextPos = [];

    for (let i = 0; i < numNodes - 2; i++) {
      for (let j = 0; j < numSeg; j++) {
        currPos.push(this.nodes[i]);
        currPos.push(this.nodes[i + 1]);
        currPos.push(this.nodes[i + 1]);
        currPos.push(this.nodes[i]);

        nextPos.push(this.nodes[i + 1]);
        nextPos.push(this.nodes[i + 2]);
        nextPos.push(this.nodes[i + 2]);
        nextPos.push(this.nodes[i + 1]);
      }
    }

    this.mesh
      .bufferData(currPos, "aCurrPos", 3)
      .bufferData(nextPos, "aNextPos", 3);
  }
}
