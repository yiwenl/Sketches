import { GL, Draw, Geom } from "alfrid";

import Config from "./Config";
import { random } from "./utils";
import { vec3 } from "gl-matrix";

import vs from "shaders/floating-particles.vert";
import fs from "shaders/floating-particles.frag";

export default class DrawFloatingParticles extends Draw {
  constructor() {
    super();

    const s = 0.05;
    const mesh = Geom.plane(s, s, 1, "xz");

    let num = GL.isMobile ? 3000 : 6000;

    const posOffset = [];
    const axis = [];
    const extras = [];

    const r = 16;
    const { sin, cos, PI, sqrt } = Math;
    const getPos = () => {
      const a = random(PI * 2);
      const _r = sqrt(random()) * r;
      return [cos(a) * r, random(r * 2), sin(a) * _r];
    };

    while (num--) {
      posOffset.push(getPos());
      axis.push(vec3.random(vec3.create(), 1));
      extras.push([random(), random(), random()]);
    }

    mesh
      .bufferInstance(posOffset, "aPosOffset")
      .bufferInstance(axis, "aAxis")
      .bufferInstance(extras, "aExtra");

    this.setMesh(mesh)
      .useProgram(vs, fs)
      .uniform("uBound", r)
      .uniform("uFloor", Config.floorLevel);
  }
}
