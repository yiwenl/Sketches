import { GL } from "../core/GL";
import { getColorTexture } from "../core/GLTexture";
import { GLShader } from "../core/GLShader";

import vs from "./glsl/pbr.vert";
import fs from "./glsl/pbr.frag";

class PBRShader extends GLShader {
  constructor() {
    super(vs, fs);

    // placeholder textures
    this.textureWhite = getColorTexture([1, 1, 1]);

    // look up textures
    this._textureLut = this.textureWhite;

    // Roughness
    this._roughness = 1.0;

    // Metallic
    this._metallic = 1.0;

    // color
    this._textureColor = this.textureWhite;
    this._baseColor = [1, 1, 1];

    // normal
    this._textureNormal = this.textureWhite;
    this._normalScale = 0;

    // ao
    this._textureORM = this.textureWhite;
    this._aoStrength = 1.0;

    // emissive
    this._textureEmissive = this.textureWhite;
    this._emissiveColor = [0, 0, 0];

    // exposure
    this._exposure = 2.2;

    // camera position
    this._cameraPos = [0, 0, 1];

    // uniforms
    this.uniform("uBRDFMap", "int", 0);
    this.uniform("uRadianceMap", "int", 1);
    this.uniform("uIrradianceMap", "int", 2);
    this.uniform("uColorMap", "int", 3);
    this.uniform("uNormalMap", "int", 4);
    this.uniform("uORMMap", "int", 5);
    this.uniform("uEmissiveMap", "int", 6);

    // setup uniforms
    this.uniform("uRoughness", this._roughness);
    this.uniform("uMetallic", this._metallic);
    this.uniform("uBaseColor", this._baseColor);
    this.uniform("uNormalScale", this._normalScale);
    this.uniform("uOcclusionStrength", this._aoStrength);
    this.uniform("uEmissiveFactor", this._emissiveColor);
    this.uniform("uCameraPos", this._cameraPos);

    this.uniform("uScaleDiffBaseMR", [0, 0, 0, 0]);
    this.uniform("uScaleFGDSpec", [0, 0, 0, 0]);
    this.uniform("uScaleIBLAmbient", [1, 1, 1, 1]);
    this.uniform("uExposure", this._exposure);

    // offset for diffuse light
    this.diffuseOffset = 0;
  }

  bindAllTextures(mGL) {
    const _GL = mGL || GL;
    this._textureLut.bind(0, _GL);

    if (this._textureRad) {
      this._textureRad.bind(1, _GL);
    } else {
      console.log("No Radiance Texture found");
    }
    if (this._textureIrr) {
      this._textureIrr.bind(2, _GL);
    } else {
      console.log("No Irradiance Texture found");
    }

    this._textureColor.bind(3);
    this._textureNormal.bind(4);
    this._textureORM.bind(5);
    this._textureEmissive.bind(6);
  }

  set lutMap(mTex) {
    this._textureLut = mTex;
  }

  set radianceMap(mTex) {
    this._textureRad = mTex;
  }

  set irradianceMap(mTex) {
    this._textureIrr = mTex;
  }

  // getters & setters for parameters

  set roughness(mValue) {
    this._roughness = mValue;
    this.uniform("uRoughness", this._roughness);
    const t =
      Math.pow((1.0 - this._roughness) * (1.0 - this._metallic), 2.0) *
      this.diffuseOffset;
    this.uniform("uScaleDiffBaseMR", [t, 0, 0, 0]);
  }

  get roughness() {
    return this._roughness;
  }

  set metallic(mValue) {
    this._metallic = mValue;
    this.uniform("uMetallic", this._metallic);
  }

  get metallic() {
    return this._metallic;
  }

  set baseColor(mValue) {
    this._baseColor = mValue;
    this.uniform("uBaseColor", this._baseColor);
  }

  get baseColor() {
    return this._baseColor;
  }

  set normalScale(mValue) {
    this._normalScale = mValue;
    this.uniform("uNormalScale", this._normalScale);
  }

  get normalScale() {
    return this._normalScale;
  }

  set aoStrength(mValue) {
    this._aoStrength = mValue;
    this.uniform("uOcclusionStrength", this._aoStrength);
  }

  get aoStrength() {
    return this._aoStrength;
  }

  set emissiveColor(mValue) {
    this._emissiveColor = mValue;
    this.uniform("uEmissiveFactor", this._emissiveColor);
  }

  get emissiveColor() {
    return this._emissiveColor;
  }

  set cameraPosition(mValue) {
    this._cameraPos = mValue;
    this.uniform("uCameraPos", this._cameraPos);
  }

  get cameraPosition() {
    return this._cameraPos;
  }

  set exposure(mValue) {
    this._exposure = mValue;
    this.uniform("uExposure", this._exposure);
  }

  get exposure() {
    return this._exposure;
  }
}

export { PBRShader };
