import { GL, DrawCopy, FboPingPong, FrameBuffer } from "alfrid";
import Scheduler from "scheduling";
import DrawSave from "./DrawSave";
import DrawSim from "./DrawSim";
import { random } from "./utils";

export let centers = [];

export default class ParticleSystem {
  constructor(numParticles) {
    this.numParticles = numParticles;

    const num = this.numParticles;

    const getCenter = () => {
      const rx = 3;
      const ry = 4;
      return [random(-rx, rx), random(-ry, ry), random(0.5, 2)];
    };

    if (centers.length === 0) {
      centers.push(getCenter());
      centers.push(getCenter());
      console.table(centers);
      centers = centers.flat();
    }

    this.seed = random(1);

    // init textures
    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };

    this._fbo = new FboPingPong(num, num, oSettings, 5);
    this._fboPos = new FrameBuffer(num, num, oSettings);

    // init views
    this._dCopy = new DrawCopy();
    this._drawSim = new DrawSim();
    this._drawSave = new DrawSave(num)
      .setClearColor(0, 0, 0, 0)
      .bindFrameBuffer(this._fbo.read)
      .draw();

    this._fboPos.bind();
    GL.clear(0, 0, 0, 1);
    this._dCopy.draw(this._fbo.read.getTexture(0));
    this._fboPos.unbind();
  }

  update(mFluidMap, mDensityMap) {
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uColorMap", this._fbo.read.getTexture(4), 4)
      .bindTexture("uFluidMap", mFluidMap, 5)
      .bindTexture("uDensityMap", mDensityMap, 6)
      .bindTexture("uPosOrgMap", this._fboPos.texture, 7)
      .uniform("uBound", this._drawSave.bound)
      .uniform("uTime", Scheduler.getElapsedTime() + this.seed)
      .uniform("uCenters", "vec3", centers)
      .draw();

    this._fbo.swap();
  }

  get fbo() {
    return this._fbo.read;
  }
}
