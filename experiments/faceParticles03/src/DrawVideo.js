import { GL, Draw, Geom } from "alfrid";

import Assets from "./Assets";
import vs from "shaders/video.vert";
import fs from "shaders/video.frag";

export default class DrawVideo extends Draw {
  constructor() {
    const ratio = 640 / 480;
    const s = 17.5;

    const t = Assets.get("lookup");
    t.minFilter = GL.NEAREST;
    t.magFilter = GL.NEAREST;

    super()
      .setMesh(Geom.plane(s, s / ratio, 1))
      .useProgram(vs, fs)
      .bindTexture("uLookupMap", t);
  }
}
