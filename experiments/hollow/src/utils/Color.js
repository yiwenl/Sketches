import hexRgb from "hex-rgb";
import rgbToHsl from "rgb-to-hsl";
import hslToRgb from "hsl-rgb";

class Color {
  constructor(r, g, b, isHSL = false) {
    if (typeof r === "string") {
      const { red, green, blue } = hexRgb(r);
      this._r = red;
      this._g = green;
      this._b = blue;
    } else {
      if (!!r.length) {
        this._r = r[0];
        this._g = r[1];
        this._b = r[2];
      } else {
        if (isHSL) {
          this._hue = r;
          this._saturation = g;
          this.lightness = b;
        } else {
          this._r = r;
          this._g = g;
          this._b = b;
        }
      }
    }

    this._updateHSL();
  }

  _updateRGB() {
    const oRGB = hslToRgb(this._hue, this._saturation, this._lightness);

    this._r = oRGB[0];
    this._g = oRGB[1];
    this._b = oRGB[2];
  }

  _updateHSL() {
    const oHSL = rgbToHsl(this._r, this._g, this._b);
    this._hue = oHSL[0];
    this._saturation = parseFloat(oHSL[1].split("%")[0]) / 100;
    this._lightness = parseFloat(oHSL[2].split("%")[0]) / 100;
  }

  // rgb
  set r(value) {
    this._r = value;
    this._updateHSL();
  }

  get r() {
    return this._r;
  }

  set g(value) {
    this._g = value;
    this._updateHSL();
  }

  get g() {
    return this._g;
  }

  set b(value) {
    this._b = value;
    this._updateHSL();
  }

  get b() {
    return this._b;
  }

  // hsl
  set hue(value) {
    this._hue = value;
    this._updateRGB();
  }

  get hue() {
    return this._hue;
  }

  set saturation(value) {
    this._saturation = value;
    this._updateRGB();
  }

  get saturation() {
    return this._saturation;
  }

  set lightness(value) {
    this._lightness = value;
    this._updateRGB();
  }

  get lightness() {
    return this._lightness;
  }

  // get value
  get hex() {
    return 0;
  }

  get value() {
    return [this._r, this._g, this._b];
  }

  get glsl() {
    return [this._r, this._g, this._b].map((v) => v / 255);
  }
}

export default Color;
