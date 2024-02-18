import { Draw } from "./Draw";
import { Geom } from "./Geom";
import { ShaderLibs } from "../shader";

class DrawCopy extends Draw {
  constructor(mGL) {
    super(mGL);

    this.setMesh(Geom.bigTriangle()).useProgram(
      ShaderLibs.bigTriangleVert,
      ShaderLibs.copyFrag
    );
  }

  draw(mTex) {
    this.bindTexture("texture", mTex, 0);
    super.draw(0);
  }
}

export { DrawCopy };
