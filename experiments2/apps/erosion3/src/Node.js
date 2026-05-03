import { vec2 } from "gl-matrix";
import { random, randomInt } from "@utils";

const MIN_LEVEL = 2;
const MAX_LEVEL = 3;
const MAX_CHILDREN = 2;
const SPREAD_ANGLE = 60;
const ANGLE_DECREMENT = 8;
const DISTANCE = 2;

const RADIANT = Math.PI / 180;

export class Node {
  constructor(pos, angle = 0, level = 0) {
    this.position = pos;
    this.angle = angle;
    this.level = level;
    this.children = [];
  }

  spawn() {
    if (this.level >= MAX_LEVEL) return;

    let numChildren = randomInt(MAX_CHILDREN + 1);
    if (this.level <= MIN_LEVEL) numChildren = Math.max(numChildren, 2);

    let startAngle = this.angle;
    let delta =
      ((SPREAD_ANGLE - this.level * ANGLE_DECREMENT) / numChildren) * RADIANT;
    startAngle -= delta * 0.5;
    for (let i = 0; i < numChildren; i++) {
      let childAngle = startAngle + i * delta + random(-1, 1) * delta * 0.25;

      const v = [DISTANCE * random(0.7, 1.3), 0];
      vec2.rotate(v, v, [0, 0], childAngle);
      vec2.add(v, v, this.position);
      const child = new Node(v, childAngle, this.level + 1);
      child.spawn();
      this.addChild(child);
    }
  }

  get x() {
    return this.position[0];
  }

  get y() {
    return this.position[1];
  }

  addChild(node) {
    this.children.push(node);
  }

  removeChild(node) {
    const index = this.children.indexOf(node);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }
}
