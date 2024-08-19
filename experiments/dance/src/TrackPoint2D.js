import { vec2 } from "gl-matrix";

export default class TrackPoint2D {
  constructor(mPos = [999, 999]) {
    this.pos = vec2.clone(mPos);
    this.prevPos = vec2.clone(mPos);
    this.dir = [0, 0];
  }

  update(mPos) {
    if (this.prevPos[0] > 100) {
      vec2.copy(this.prevPos, mPos);
    } else {
      vec2.copy(this.prevPos, this.pos);
    }

    vec2.copy(this.pos, mPos);
    vec2.sub(this.dir, this.pos, this.prevPos);
    vec2.normalize(this.dir, this.dir);
  }

  reset(mPos = [999, 999]) {
    vec2.copy(this.pos, mPos);
    vec2.copy(this.prevPos, this.pos);
    this.dir = [0, 0];
  }

  get speed() {
    return vec2.distance(this.pos, this.prevPos);
  }
}
