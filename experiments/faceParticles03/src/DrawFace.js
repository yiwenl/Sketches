import { GL, Draw, Mesh } from "alfrid";
import FaceMeshIndices from "./FaceMeshIndices";

import vs from "shaders/face.vert";
import fs from "shaders/face.frag";

export default class DrawFace extends Draw {
  constructor() {
    super().useProgram(vs, fs);
    this.mesh = new Mesh().bufferIndex(FaceMeshIndices);

    this._isReady = false;
  }

  update(mPoints) {
    this.mesh.bufferVertex(mPoints);
    if (!this._isReady) {
      this.setMesh(this.mesh);
    }
    this._isReady = true;
  }

  draw() {
    if (!this._isReady) return;

    super.draw();
  }
}
