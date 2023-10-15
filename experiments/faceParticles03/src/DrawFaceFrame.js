import { Draw, Mesh, GL } from "alfrid";
import FaceMeshIndices from "./FaceMeshIndices";

import vs from "shaders/faceFrame.vert";
import fs from "shaders/faceFrame.frag";

export default class DrawFaceFrame extends Draw {
  constructor() {
    super().useProgram(vs, fs);

    this.mesh = new Mesh(GL.LINES).bufferIndex(FaceMeshIndices);
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
