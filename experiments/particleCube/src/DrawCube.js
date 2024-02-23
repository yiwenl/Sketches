import { Draw, Mesh, GL } from "alfrid";

import { random } from "./utils";
import { vec3 } from "gl-matrix";

import vs from "shaders/points.vert";
import fs from "shaders/points.frag";

export default class DrawCube extends Draw {
  constructor() {
    super();

    const total = 150000;
    let num = total;
    const positions = [];
    const extras = [];
    const indices = [];

    let r = 0.5;

    while (num--) {
      positions.push([random(-r, r), random(-r, r), random(-r, r)]);
      extras.push([random(1, 2), random(), num]);
      indices.push(num);
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferData(extras, "aExtra")
      .bufferIndex(indices);

    // instancing
    const numCubes = 25;
    const axis = [];
    const posOffset = [];
    const randoms = [];

    r = 1.5;
    for (let i = 0; i < numCubes; i++) {
      axis.push(vec3.random([], 1));
      posOffset.push([random(-r, r), random(-r, r), random(-r, r)]);
      randoms.push([random(Math.PI * 2), random(), random()]);
    }

    mesh
      .bufferInstance(axis, "aAxis")
      .bufferInstance(posOffset, "aPosOffset")
      .bufferInstance(randoms, "aRandom");

    this.setMesh(mesh).useProgram(vs, fs).uniform("uTotal", total);
  }
}
