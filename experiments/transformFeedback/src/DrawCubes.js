import { Draw, Geom } from "alfrid";
import { random, randomGaussian } from "./utils";
import vs from "shaders/cubes.vert";
import fs from "shaders/cubes.frag";

export default class DrawCubes extends Draw {
  constructor() {
    super();

    const s = 1;
    const mesh = Geom.cube(s, s * 10, s);
    // const mesh = Geom.sphere(1, 24);

    const posOffsets = [];
    const scales = [];
    const extras = [];

    const r = 15;
    const minScale = 0.5;
    const maxScale = 8;

    let numInstances = 22;
    while (numInstances--) {
      posOffsets.push([
        random(-r, r),
        randomGaussian(-1, 1) * 2,
        random(-r, r),
      ]);
      scales.push([
        randomGaussian(minScale, maxScale),
        randomGaussian(minScale, maxScale),
        randomGaussian(minScale, maxScale),
      ]);
      extras.push([random(), random(), random()]);
    }

    mesh
      .bufferInstance(posOffsets, "aOffset")
      .bufferInstance(scales, "aScale")
      .bufferInstance(extras, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}
