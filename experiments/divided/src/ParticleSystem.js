import { GL, FboPingPong } from "alfrid";
import { random } from "./utils";
import Scheduler from "scheduling";
import DrawSave from "./DrawSave";
import DrawSim from "./DrawSim";

export default class ParticleSystem {
  constructor(mNumParticles) {
    const num = mNumParticles;

    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };

    this._fbo = new FboPingPong(num, num, oSettings, 4);

    // init particle
    new DrawSave(num)
      .setClearColor(0, 0, 0, 1)
      .bindFrameBuffer(this._fbo.read)
      .draw();

    this._drawSim = new DrawSim().uniform("uSeeds", [
      random(),
      random(10),
      random(10),
    ]);
  }

  update(mTexBg) {
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .setClearColor(0, 0, 0, 1)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uBgMap", mTexBg, 4)
      .uniform("uTime", Scheduler.getTime() / 1000)
      .uniform("uBound", 6)
      .draw();

    this._fbo.swap();
  }

  get fbo() {
    return this._fbo.read;
  }
}
