import { vec2 } from "gl-matrix";
import { videoWidth, videoHeight } from "./FaceDetection";
import { mix, clamp, random, smoothstep } from "./utils";
import Scheduler from "scheduling";

let maxSpeed = 0.1;

export default class ControlPoint {
  constructor(mIndex) {
    this._index = mIndex;
    this.isReady = false;
    this.posTarget = [0, 0];
    this.posTargetPre = [0, 0];
    this.targetDir = [0, 0];
    this.pos = [0, 0];
    this.dir = [0, 0];
    this.speed = 0;

    this.radius = random(2, 1);
    this.baseRadius = this.radius;
    this.strength = random(3, 8);
    this.baseStrength = this.strength;

    Scheduler.addEF(this.loop);
  }

  loop = () => {
    let easing = 0.2;

    this.pos[0] += (this.posTarget[0] - this.pos[0]) * easing;
    this.pos[1] += (this.posTarget[1] - this.pos[1]) * easing;

    this.dir[0] += (this.targetDir[0] - this.dir[0]) * easing;
    this.dir[1] += (this.targetDir[1] - this.dir[1]) * easing;
    vec2.normalize(this.dir, this.dir);
  };

  getMappedUVPosition(keypoints) {
    const p = keypoints[this._index];
    return [p.x / videoWidth, 1.0 - p.y / videoHeight];
  }

  update(keypoints) {
    vec2.copy(this.posTargetPre, this.posTarget);
    this.posTarget = this.getMappedUVPosition(keypoints);
    this.speed = vec2.distance(this.posTargetPre, this.posTarget);
    this.speed = smoothstep(maxSpeed * 0.1, maxSpeed, this.speed / maxSpeed);

    const t = Math.pow(this.speed, 3.0);

    vec2.sub(this.targetDir, this.posTarget, this.posTargetPre);
    vec2.normalize(this.targetDir, this.targetDir);

    this.strength = this.baseStrength * mix(0, 4.0, t);
    this.baseRadius = this.baseRadius * mix(0, 3.0, t);

    if (!this.isReady) {
      if (vec2.length(this.posTargetPre > 0)) {
        this.isReady = true;
      }
    }
  }
}
