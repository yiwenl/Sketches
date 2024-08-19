import { GL, DrawCopy, Draw, Mesh, FrameBuffer } from "alfrid";
import { random } from "./utils";

import vs from "shaders/ribbon.vert";
import fs from "shaders/ribbon.frag";

export default class DrawRibbon extends Draw {
  constructor(mNum, mNumSets) {
    super();

    this.num = mNum;
    this.numSets = mNumSets;
    const { num, numSets } = this;

    const positions = [];
    const uvs = [];
    const normals = [];
    const indices = [];

    let count = 0;

    const numSides = 3;

    const getPos = (i, j) => {
      const a = ((Math.PI * 2) / numSides) * j;
      const z = Math.cos(a);
      const y = Math.sin(a);
      const r = 0.02;

      const pos = [i, y * r, z * r];
      const normal = [0, y, z];

      return {
        pos,
        normal,
      };
    };

    const addVertex = (i, j) => {
      const { pos, normal } = getPos(i, j);
      positions.push(pos);
      normals.push(normal);
      uvs.push([i / totalSets, j / numSides]);
    };

    const totalSets = numSets * numSets;

    for (let i = 0; i < totalSets - 1; i++) {
      for (let j = 0; j < numSides; j++) {
        addVertex(i, j);
        addVertex(i + 1, j);
        addVertex(i + 1, j + 1);
        addVertex(i, j + 1);

        indices.push(count * 4 + 0);
        indices.push(count * 4 + 1);
        indices.push(count * 4 + 2);
        indices.push(count * 4 + 0);
        indices.push(count * 4 + 2);
        indices.push(count * 4 + 3);

        count++;
      }
    }

    const mesh = new Mesh()
      .bufferVertex(positions)
      .bufferTexCoord(uvs)
      .bufferNormal(normals)
      .bufferIndex(indices);

    // instancing
    const uvOffsets = [];
    const extras = [];

    for (let i = 0; i < num; i++) {
      for (let j = 0; j < num; j++) {
        uvOffsets.push([(i + 0.5) / num / numSets, (j + 0.5) / num / numSets]);
        extras.push([random(0.2, 0.4), random(), random()]);
      }
    }

    mesh
      .bufferInstance(uvOffsets, "aUVOffset")
      .bufferInstance(extras, "aExtra");

    this.setMesh(mesh)
      .useProgram(vs, fs)
      .uniform("uTotal", totalSets)
      .uniform("uNumSets", numSets);

    this._index = 0;
    this._dCopy = new DrawCopy();

    // fbo
    const fboSize = num * numSets;
    const oSettings = {
      type: GL.FLOAT,
      minFilter: GL.NEAREST,
      magFilter: GL.NEAREST,
    };
    this._fboPos = new FrameBuffer(fboSize, fboSize, oSettings);
  }

  init(mPosMap) {
    const { num, numSets } = this;
    this._fboPos.bind();
    GL.clear(1, 0, 0, 1);
    for (let j = 0; j < numSets; j++) {
      for (let i = 0; i < numSets; i++) {
        GL.viewport(i * num, j * num, num, num);
        this._dCopy.draw(mPosMap);
      }
    }
    this._fboPos.unbind();
  }

  update(mPosMap) {
    GL.disable(GL.DEPTH_TEST);
    const { num, numSets } = this;

    const tx = this._index % numSets;
    const ty = Math.floor(this._index / numSets);
    this._index++;
    if (this._index >= numSets * numSets) {
      this._index = 0;
    }
    this._fboPos.bind();
    GL.viewport(tx * num, ty * num, num, num);
    this._dCopy.draw(mPosMap);
    this._fboPos.unbind();
    GL.enable(GL.DEPTH_TEST);
  }

  draw() {
    this.uniform("uIndex", this._index).bindTexture("uPosMap", this.posMap, 0);
    super.draw();
  }

  get posMap() {
    return this._fboPos.texture;
  }
}
