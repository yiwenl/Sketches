import { Draw, Geom } from "@alfrid";
import { random } from "@utils";
import vs from "./shaders/walls.vert";
import fs from "./shaders/walls.frag";

export default class Walls {
  constructor() {
    const maxRange = 10;

    let x = -maxRange;
    let shouldBeWall = true;
    const positions = [];
    const scales = [];

    let z = 2.4;
    while (x < maxRange) {
      let w;
      if (shouldBeWall) {
        w = random(0.2, 0.3);
        positions.push([x, 0, z]);
        scales.push([w, 10, 0.2]);
      } else {
        w = random(1, 2);
      }

      shouldBeWall = !shouldBeWall;

      x += w;
    }

    const floorPos = 2;
    const floorScale = 10;
    positions.push([0, floorPos + floorScale / 2, z]);
    scales.push([100, floorScale, 1]);
    positions.push([0, -floorPos - floorScale / 2, z]);
    scales.push([100, floorScale, 1]);

    const mesh = Geom.cube(1, 1, 1);

    mesh
      .bufferInstance(positions, "aPosOffset")
      .bufferInstance(scales, "aScale");

    this._draw = new Draw().setMesh(mesh).useProgram(vs, fs);
  }

  uniform(name, value) {
    this._draw.uniform(name, value);
    return this._draw;
  }

  draw() {
    this._draw.draw();
  }
}
