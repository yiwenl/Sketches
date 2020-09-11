import alfrid, { GL } from "alfrid";

import Assets from "./Assets";
import vs from "shaders/bg.vert";
import fs from "shaders/bg.frag";

class DrawBackground extends alfrid.Draw {
  constructor() {
    super();

    this.setMesh(alfrid.Geom.skybox(20)).useProgram(vs, fs);
  }

  draw() {
    // const env = "studio";
    const env = "street0";
    this.uniformTexture("texture", Assets.get(`${env}_radiance`), 0);
    super.draw();
  }
}

export default DrawBackground;
