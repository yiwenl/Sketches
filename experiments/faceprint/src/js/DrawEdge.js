import alfrid, { GL } from "alfrid";

import fs from "shaders/edge.frag";

class DrawEdge extends alfrid.Draw {
  constructor() {
    super();

    this.setMesh(alfrid.Geom.bigTriangle()).useProgram(
      alfrid.ShaderLibs.bigTriangleVert,
      fs
    );
  }
}

export default DrawEdge;
