import alfrid, { GL } from "alfrid";

import Config from "./Config.js";
import { quat, vec3 } from "gl-matrix";
import { random } from "randomutils";
import vs from "shaders/save.vert";
import fs from "shaders/save.frag";

class DrawSave extends alfrid.Draw {
  constructor() {
    super();

    const { numParticles: num } = Config;

    const positions = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    let count = 0;

    const r = 0.1;
    const q = quat.create();
    const axis = vec3.create();
    const getPos = () => {
      const v = vec3.fromValues(random(r), 0, 0);
      vec3.set(axis, random(-1, 1), random(-1, 1), random(-1, 1));
      vec3.normalize(axis, axis);
      quat.setAxisAngle(q, axis, random(Math.PI * 2));
      vec3.transformQuat(v, v, q);
      return v;
    };

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        positions.push(getPos());
        normals.push([Math.random(), Math.random(), Math.random()]);
        uvs.push([(i / num) * 2 - 1, (j / num) * 2 - 1]);
        indices.push(count);
        count++;
      }
    }

    const mesh = new alfrid.Mesh(GL.POINTS);
    mesh.bufferVertex(positions);
    mesh.bufferTexCoord(uvs);
    mesh.bufferNormal(normals);
    mesh.bufferIndex(indices);

    this.setMesh(mesh).useProgram(vs, fs);
  }
}

export default DrawSave;
