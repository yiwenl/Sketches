import EventDispatcher from "events";
import { Ray } from "../math/Ray";
import { getMouse } from "../utils";
import { mat4, vec3 } from "gl-matrix";

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

class HitTestor extends EventDispatcher {
  constructor(
    mMesh,
    mCamera,
    mResolution,
    mSkipMoveCheck = false,
    mListenerTarget = window
  ) {
    super();

    this._mesh = mMesh;
    this._mesh.generateFaces();
    this._camera = mCamera;
    this.faceVertices = mMesh.faces.map((face) => face.vertices);
    this.clickTolerance = 8;

    this._ray = new Ray([0, 0, 0], [0, 0, -1]);
    this._hit = vec3.fromValues(-999, -999, -999);
    this._lastPos;
    this._firstPos;
    this.modelMatrix = mat4.create();
    this.resolution = mResolution || [window.innerWidth, window.innerHeight];

    this._listenerTarget = mListenerTarget;
    this._skippingMove = mSkipMoveCheck;

    this._onMoveBind = (e) => this._onMove(e);
    this._onDownBind = (e) => this._onDown(e);
    this._onUpBind = () => this._onUp();

    this.connect();
  }

  connect() {
    this._listenerTarget.addEventListener("mousedown", this._onDownBind);
    this._listenerTarget.addEventListener("mousemove", this._onMoveBind);
    this._listenerTarget.addEventListener("mouseup", this._onUpBind);
  }

  disconnect() {
    this._listenerTarget.removeEventListener("mousedown", this._onDownBind);
    this._listenerTarget.removeEventListener("mousemove", this._onMoveBind);
    this._listenerTarget.removeEventListener("mouseup", this._onUpBind);
  }

  _checkHit(mType = "onHit") {
    const camera = this._camera;
    if (!camera) {
      return;
    }

    const mx = (this._lastPos.x / this.resolution[0]) * 2.0 - 1.0;
    const my = -(this._lastPos.y / this.resolution[1]) * 2.0 + 1.0;

    camera.generateRay([mx, my, 0], this._ray);

    let hit;
    const v0 = vec3.create();
    const v1 = vec3.create();
    const v2 = vec3.create();
    let dist = 0;

    const getVector = (v, target) => {
      vec3.transformMat4(target, v, this.modelMatrix);
    };

    for (let i = 0; i < this.faceVertices.length; i++) {
      const vertices = this.faceVertices[i];
      getVector(vertices[0], v0);
      getVector(vertices[1], v1);
      getVector(vertices[2], v2);
      const t = this._ray.intersectTriangle(v0, v1, v2);

      if (t) {
        if (hit) {
          const distToCam = vec3.dist(t, camera.position);
          if (distToCam < dist) {
            hit = vec3.clone(t);
            dist = distToCam;
          }
        } else {
          hit = vec3.clone(t);
          dist = vec3.dist(hit, camera.position);
        }
      }
    }

    if (hit) {
      this._hit = vec3.clone(hit);
      this.emit(mType, { hit });
    } else {
      this.emit("onUp");
    }
  }

  _onDown(e) {
    this._firstPos = getMouse(e);
    this._lastPos = getMouse(e);
    this._checkHit("onDown");
  }

  _onMove(e) {
    this._lastPos = getMouse(e);
    if (!this._skippingMove) {
      this._checkHit();
    }
  }

  _onUp() {
    const dist = distance(this._firstPos, this._lastPos);
    if (dist < this.clickTolerance) {
      this._checkHit();
    }
  }
}

export { HitTestor };
