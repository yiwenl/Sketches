import { Draw } from "./Draw";
import { Geom } from "./Geom";
import { ShaderLibs } from "../shader";

class DrawBall extends Draw {
  constructor(mGL) {
    super(mGL);

    this.setMesh(Geom.sphere(1, 12))
      .useProgram(ShaderLibs.generalVert, ShaderLibs.simpleColorFrag)
      .uniform("uRotation", [0, 0, 0]);
  }

  draw(mPos, mScale = [1, 1, 1], mColor = [1, 1, 1], mOpacity = 1) {
    this.uniform("uTranslate", mPos)
      .uniform("uScale", mScale)
      .uniform("uColor", mColor)
      .uniform("uOpacity", mOpacity);
    super.draw(0);
  }
}

export { DrawBall };
