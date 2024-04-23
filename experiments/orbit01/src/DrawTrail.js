import { Draw, Mesh } from "alfrid";

import vs from "shaders/trail.vert";
import fs from "shaders/blocks.frag";
import { random } from "./utils";

import { vec3, mat4 } from "gl-matrix";

let numNodes = 400;
let numSeg = 3;

export default class DrawTrail extends Draw {
  constructor() {
    super();

    this.mesh = new Mesh();

    this.setMesh(this.mesh).useProgram(vs, fs);
    this.radius = random(0.01, 0.025);
    this.nodes = [];
  }

  reset(pos) {
    for (let i = 0; i < numNodes; i++) {
      this.nodes.push([pos[0], pos[1], pos[2]]);
    }
  }

  update(pos) {
    this.nodes.shift();
    this.nodes.push([pos[0], pos[1], pos[2]]);

    const positions = [];
    const uvs = [];
    const normals = [];
    const indices = [];
    const { PI, acos } = Math;
    const r = this.radius;
    const m = mat4.create();

    const axisX = [1, 0, 0];

    const addVertex = (i, j) => {
      const nodeCurr = this.nodes[i];
      const nodeNext = this.nodes[i + 1];
      const dir = vec3.subtract(vec3.create(), nodeNext, nodeCurr);
      vec3.normalize(dir, dir);

      const axis = vec3.cross(vec3.create(), dir, axisX);
      const angle = acos(vec3.dot(dir, axisX));

      mat4.identity(m);
      mat4.rotate(m, m, angle, axis);

      const p = [0, r, 0];
      const n = [0, 1, 0];
      const a = (PI * 2 * j) / numSeg;
      vec3.rotateX(p, p, [0, 0, 0], a);
      vec3.rotateX(n, n, [0, 0, 0], a);

      vec3.transformMat4(p, p, m);
      vec3.transformMat4(n, n, m);

      vec3.add(p, p, this.nodes[i]);

      positions.push(p);
      normals.push(n);
      uvs.push([i / numNodes, j / numSeg]);
    };

    let count = 0;
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

    this.mesh
      .bufferVertex(positions)
      .bufferNormal(normals)
      .bufferIndex(indices);
  }
}
