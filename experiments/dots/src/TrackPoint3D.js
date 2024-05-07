import { vec3 } from "gl-matrix";

export default class TrackPoint3D {
  constructor(mPos = [0, 0, 0]) {
    this.pos = vec3.clone(mPos);
    this.prevPos = vec3.clone(mPos);
    this.dir = [0, 0, 0];
  }

  update(mPos) {
    if (this.prevPos[0] > 100) {
      vec3.copy(this.prevPos, mPos);
    } else {
      vec3.copy(this.prevPos, this.pos);
    }

    vec3.copy(this.pos, mPos);
    vec3.sub(this.dir, this.pos, this.prevPos);
    vec3.normalize(this.dir, this.dir);
  }

  reset(mPos = [0, 0, 0]) {
    vec3.copy(this.pos, mPos);
    vec3.copy(this.prevPos, this.pos);
  }

  get position() {
    return this.pos;
  }

  get speed() {
    return vec3.distance(this.pos, this.prevPos);
  }
}
