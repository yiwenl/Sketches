import "./hash.js";
import { targetWidth, targetHeight } from "./features.js";
import { mix, smoothstep } from "./utils";
import setupProject from "./utils/setupProject2D.js";
import { EaseNumber, SpringNumber } from "alfrid";

import Settings from "./Settings.js";
import addControls from "./utils/addControl.js";

import Scheduler from "scheduling";

class EaseNumber2 {
  constructor(value, speed = 0.1) {
    this.friction = 0.95;
    this._value = value;
    this._target = value;
    this._range = 0;

    this._vel = 0;
    this.speed = speed;

    Scheduler.addEF(() => this.update());
  }

  update() {
    const delta = this._target - this._value;
    const _delta = Math.abs(delta);

    let acc = 0;
    let fAcc = smoothstep(this._range, this._range * 2, _delta);

    acc += delta * this.speed * fAcc * 0.05;

    if (_delta > this._range) {
      this._vel += acc;
    }
    this._vel *= this.friction;
    this._value += this._vel;

    if (Math.abs(this._target - this._value) < Math.abs(this._vel)) {
      this._vel = 0;
      this._value = this._target;
    }
  }

  set value(v) {
    this._target = v;
    this._range = Math.abs(this._target - this._value) / 2;
  }

  get value() {
    return this._value;
  }
}

let easeNumber = new EaseNumber(0, 0.05);
let springNumber = new SpringNumber(0, 0.05, 0.8);
let easeNumber2 = new EaseNumber2(0, 0.1);
// development
if (process.env.NODE_ENV === "development") {
  Settings.init();
  // addControls();
}
const { ctx, width, height, canvas } = setupProject(targetWidth, targetHeight);

const DELAY = 2000;

const dot = (x, y, r = 40, c = "white") => {
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

const toggle = () => {
  easeNumber.value = easeNumber.value === 0 ? width : 0;
  springNumber.value = springNumber.value === 0 ? width : 0;
  easeNumber2.value = easeNumber2.value === 0 ? width : 0;

  setTimeout(toggle, DELAY);
};

// toggle();

// mouse following

canvas.addEventListener("mousemove", (e) => {
  const s = 3;
  easeNumber.value = e.clientX * s;
  springNumber.value = e.clientX * s;
  easeNumber2.value = e.clientX * s;
});

const loop = () => {
  ctx.clearRect(0, 0, width, height);

  dot(easeNumber.value, height / 4);
  dot(springNumber.value, height / 2);
  dot(easeNumber2.value, (height * 3) / 4);
  // dot(easeNumber2.value, height / 2);
};

Scheduler.addEF(loop);
