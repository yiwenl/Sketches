import { GL, Draw, Geom, ShaderLibs, FboPingPong } from "alfrid";
import { random } from "./utils";
import Scheduler from "scheduling";
import fs from "shaders/ink.frag";

import generateVoronoiMap from "./generateVoronoiMap";

export default class Background {
  constructor(mW, mH) {
    this._fbo = new FboPingPong(mW, mH);

    this._fbo.all.forEach((fbo) => {
      fbo.bind();
      GL.clear(0, 0, 0, 1);
      fbo.unbind();
    });

    this._textureVoronoi = generateVoronoiMap();

    // draw calls
    this._drawInk = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(ShaderLibs.bigTriangleVert, fs)
      .setClearColor(0, 0, 0, 0)
      .uniform("uSeeds", [random(10), random(10), random(10)])
      .uniform("uRatio", mW / mH);
  }

  update(mFluidMap, mDensityMap) {
    this._drawInk
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uMap", this._fbo.read.texture, 0)
      .bindTexture("uFluidMap", mFluidMap, 1)
      .bindTexture("uDensityMap", mDensityMap, 2)
      .bindTexture("uVoronoiMap", this._textureVoronoi, 3)
      .uniform("uTime", Scheduler.getElapsedTime() * 0.1)
      .draw();

    this._fbo.swap();
  }

  get texture() {
    return this._fbo.read.texture;
  }
}
