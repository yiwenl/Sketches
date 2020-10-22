import alfrid, { GL } from "alfrid";
import Config from "./Config";
import vs from "shaders/planes.vert";
import fs from "shaders/planes.frag";
import { random } from "randomutils";

class DrawPlane extends alfrid.Draw {
  constructor() {
    super();
    const NUM_PLANES = Config.numPlanes;

    const s = 0.01;
    const mesh = alfrid.Geom.plane(s, s, 1, "xy");

    const getPos = () => {
      const r = 1.0;
      return [random(-r, r), random(-r, r), random(0, 1)];
    };

    const posOffsets = [];
    const extras = [];
    for (let i = 0; i < NUM_PLANES; i++) {
      posOffsets.push(getPos());
      extras.push([Math.random(), Math.random(), Math.random()]);
    }
    mesh.bufferInstance(posOffsets, "aPosOffset");
    mesh.bufferInstance(extras, "aExtra");

    this.setMesh(mesh).useProgram(vs, fs);
  }
}

export default DrawPlane;
