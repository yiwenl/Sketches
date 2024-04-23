// OrbitalControl.js
import { EaseNumber } from "./EaseNumber";
import Scheduler from "scheduling";
import { vec3, mat4 } from "gl-matrix";

const getMouse = function (mEvent, mTarget) {
  const o = mTarget || {};
  if (mEvent.touches) {
    o.x = mEvent.touches[0].pageX;
    o.y = mEvent.touches[0].pageY;
  } else {
    o.x = mEvent.clientX;
    o.y = mEvent.clientY;
  }

  return o;
};

class OrbitalControl {
  // states
  #isRotationLocked = false;
  #isZoomLocked = false;
  #isShiftDown = false;
  #isMouseDown = false;

  // properties
  #target;
  #mouse = {};
  #preMouse = {};
  #mtx = mat4.create();
  #mtxInvert = mat4.create();
  #mtxShift = mat4.create();
  #mtxShiftSaved = mat4.create();
  #center = vec3.create();
  #position = vec3.create();
  #up = vec3.fromValues(0, 1, 0);

  radius = new EaseNumber(0);
  rx = new EaseNumber(0);
  ry = new EaseNumber(0);

  #rxSaved = 0;
  #rySaved = 0;

  constructor(mTarget, mRadius = 5, mListenerTarget = window) {
    this.#target = mTarget;

    this.radius.setTo(mRadius);
    this.#position = [0, 0, this.radius];

    // limit camera angle
    this.rx.limit(-Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);

    // events
    mListenerTarget.addEventListener("mousewheel", this._onWheel);
    mListenerTarget.addEventListener("DOMMouseScroll", this._onWheel);

    mListenerTarget.addEventListener("mousedown", this._onDown);
    mListenerTarget.addEventListener("mousemove", this._onMove);
    window.addEventListener("mouseup", this._onUp);

    mListenerTarget.addEventListener("touchstart", this._onDown);
    mListenerTarget.addEventListener("touchmove", this._onMove);
    window.addEventListener("touchend", this._onUp);

    // key
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);

    this.update();
    Scheduler.addEF(this._loop);
  }

  // public methods
  lock(mLock = true) {
    this.#isRotationLocked = mLock;
    this.#isZoomLocked = mLock;
    this.#isMouseDown = false;
  }

  lockZoom(mValue = true) {
    this.#isZoomLocked = mValue;
  }

  lockRotation(mValue = true) {
    this.#isRotationLocked = mValue;
  }

  update() {
    vec3.set(this.#position, 0, 0, this.radius.value);
    vec3.rotateX(this.#position, this.#position, [0, 0, 0], this.rx.value);
    vec3.rotateY(this.#position, this.#position, [0, 0, 0], this.ry.value);

    mat4.lookAt(this.#mtx, this.#position, this.#center, this.#up);
    mat4.invert(this.#mtxInvert, this.#mtx);

    // apply shift
    mat4.mul(this.#mtx, this.#mtx, this.#mtxShiftSaved);
    mat4.mul(this.#mtx, this.#mtx, this.#mtxShift);

    this.#target?.setViewMatrix(this.#mtx);
  }

  // event handling
  _onDown = (e) => {
    if (this.#isRotationLocked) return;
    this.#isMouseDown = true;
    getMouse(e, this.#mouse);
    getMouse(e, this.#preMouse);
    this.#rxSaved = this.rx.targetValue;
    this.#rySaved = this.ry.targetValue;
    mat4.identity(this.#mtxShift);
  };

  _onMove = (e) => {
    if (this.#isRotationLocked) return;
    if (!this.#isMouseDown) return;

    getMouse(e, this.#mouse);

    if (e.shiftKey) {
      const diff = [
        this.#mouse.x - this.#preMouse.x,
        -(this.#mouse.y - this.#preMouse.y),
        0,
      ];
      vec3.transformMat4(diff, diff, this.#mtxInvert);
      vec3.scale(diff, diff, 0.01);
      mat4.identity(this.#mtxShift, this.#mtxShift);
      mat4.translate(this.#mtxShift, this.#mtxShift, diff);
      return;
    }

    const dx = this.#mouse.x - this.#preMouse.x;
    this.ry.value = -dx * 0.01 + this.#rySaved;

    const dy = this.#mouse.y - this.#preMouse.y;
    this.rx.value = -dy * 0.01 + this.#rxSaved;
  };

  _onUp = () => {
    this.#isMouseDown = false;

    if (this.#isShiftDown) {
      mat4.mul(this.#mtxShiftSaved, this.#mtxShiftSaved, this.#mtxShift);
      mat4.identity(this.#mtxShift);
    }
  };

  _onWheel = (e) => {
    if (this.#isZoomLocked) {
      return;
    }
    const w = e.wheelDelta;
    const d = e.detail;
    let value = 0;
    if (d) {
      if (w) {
        value = (w / d / 40) * d > 0 ? 1 : -1; // Opera
      } else {
        value = -d / 3; // Firefox;         TODO: do not /3 for OS X
      }
    } else {
      value = w / 120;
    }

    this.radius.add(-value * 2);
    if (this.radius.targetValue < 0) {
      this.radius.value = 0.0001;
    }
  };

  _onKeyDown = (e) => {
    if (e.code.indexOf("Shift") > -1) {
      this.#isShiftDown = true;
    }
  };

  _onKeyUp = (e) => {
    if (e.key === "Shift") {
      mat4.mul(this.#mtxShiftSaved, this.#mtxShiftSaved, this.#mtxShift);
      mat4.identity(this.#mtxShift);
    }
    this.#isShiftDown = false;
  };

  // private method
  _loop = () => {
    this.update();
  };
}

export { OrbitalControl };
