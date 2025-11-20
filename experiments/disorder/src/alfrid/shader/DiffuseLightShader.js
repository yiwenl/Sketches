import { GLShader } from "../core/GLShader";

import vs from "./glsl/basic.vert";
import fs from "./glsl/diffuse.frag";

class DiffuseLightShader extends GLShader {
  constructor(mColor = [1, 1, 1], mLight = [1, 1, 1], mIntensity = 0.5) {
    super(vs, fs);

    this.color = mColor;
    this.light = mLight;
    this.intensity = mIntensity;
  }

  get color() {
    return this._color;
  }

  set color(mValue) {
    this._color = mValue;
    this.uniform("uColor", this._color);
  }

  get light() {
    return this._light;
  }

  set light(mValue) {
    this._light = mValue;
    this.uniform("uLight", this._light);
  }

  get intensity() {
    return this._intensity;
  }

  set intensity(mValue) {
    this._intensity = mValue;
    this.uniform("uLightIntensity", this._intensity);
  }
}

export { DiffuseLightShader };
