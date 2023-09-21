import { GLShader } from "../core/GLShader";

import vs from "./glsl/basic.vert";
import fs from "./glsl/simpleColor.frag";

class BasicColorShader extends GLShader {
  constructor(mColor = [1, 1, 1], mOpacity = 1) {
    super(vs, fs);

    this.color = mColor;
    this.opacity = mOpacity;
  }

  get color() {
    return this._color;
  }

  set color(mValue) {
    this._color = mValue;
    this.uniform("uColor", this._color);
  }

  get opacity() {
    return this._opacity;
  }

  set opacity(mValue) {
    this._opacity = mValue;
    this.uniform("uOpacity", this._opacity);
  }
}

export { BasicColorShader };
