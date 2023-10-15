import { Draw, Geom, Mesh, GL, FboPingPong } from "alfrid";

import { random, toGlsl } from "./utils";
import Config from "./Config";
import Scheduler from "scheduling";

// shaders
import vsSave from "shaders/save.vert";
import fsSave from "shaders/save.frag";
import vsPass from "shaders/pass.vert";
import fsSim from "shaders/sim-sub.frag";
import vsRender from "shaders/render-sub.vert";
import fsRender from "shaders/render-sub.frag";

const num = 128;
const FLUID_BOUND = 4;

export default class SubParticles {
  constructor() {
    const oSettings = {
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
      type: GL.FLOAT,
    };

    this._fbo = new FboPingPong(num, num, oSettings, 5);

    this._initParticles();

    // create draw calls
    this._drawSim = new Draw()
      .setMesh(Geom.bigTriangle())
      .useProgram(vsPass, fsSim)
      .setClearColor(0, 0, 0, 1);

    this._drawRender = new Draw()
      .setMesh(this._generateParticleMesh())
      .useProgram(vsRender, fsRender);
  }

  _generateParticleMesh() {
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        positions.push([random(), random(), random(0)]);
        uvs.push([i / num, j / num]);
        indices.push(i + j * num);
      }
    }

    return new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferIndex(indices);
  }

  _initParticles() {
    const positions = [];
    const uvs = [];
    const normals = [];
    const datas = [];
    const indices = [];
    let count = 0;

    const r = 8;
    const getPos = () => [random(-r, r), random(-r, r) / GL.aspectRatio, 0];
    for (let j = 0; j < num; j++) {
      for (let i = 0; i < num; i++) {
        positions.push(getPos());
        uvs.push([
          (i / num) * 2 - 1 + 0.5 / num,
          (j / num) * 2 - 1 + 0.5 / num,
        ]);
        normals.push([random(), random(), random()]);
        datas.push([0, 0, random()]);
        indices.push(count);
        count++;
      }
    }

    const mesh = new Mesh(GL.POINTS)
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferData(datas, "aData", 3)
      .bufferIndex(indices);

    new Draw()
      .setMesh(mesh)
      .useProgram(vsSave, fsSave)
      .setClearColor(0, 0, 0, 0)
      .bindFrameBuffer(this._fbo.read)
      .draw();
  }

  update(fluid) {
    this._drawSim
      .bindFrameBuffer(this._fbo.write)
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uExtraMap", this._fbo.read.getTexture(2), 2)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 3)
      .bindTexture("uPosOrgMap", this._fbo.read.getTexture(4), 4)
      .bindTexture("uFluidMap", fluid.velocity, 5)
      .bindTexture("uDensityMap", fluid.density, 6)
      .uniform("uBound", FLUID_BOUND)
      .draw();

    this._fbo.swap();
  }

  render() {
    GL.disable(GL.DEPTH_TEST);
    GL.enableAdditiveBlending();
    this._drawRender
      .bindTexture("uPosMap", this._fbo.read.getTexture(0), 0)
      .bindTexture("uVelMap", this._fbo.read.getTexture(1), 1)
      .bindTexture("uDataMap", this._fbo.read.getTexture(3), 2)
      .uniform("uColor0", Config.colorHighlight.map(toGlsl))
      .uniform("uColor1", Config.colorShadow.map(toGlsl))
      .uniform("uTime", Scheduler.getElapsedTime())
      .draw();

    GL.enable(GL.DEPTH_TEST);
    GL.enableAlphaBlending();
  }

  get fbo() {
    return this._fbo.read;
  }
}
