export default class EaseNumber {
  constructor(value, easing) {
    this._value = value;
    this._target = value;
    this.easing = easing;

    this._update();
  }

  setTo(value) {
    this._value = this._target = value;
  }

  limit(min, max) {
    if (min > max) {
      this.limit(max, min);
      return;
    }

    this._min = min;
    this._max = max;
    this._checkLimit();
  }

  _checkLimit() {
    if (this._min !== undefined && this._target < this._min) {
      this._target = this._min;
    }

    if (this._max !== undefined && this._target > this._max) {
      this._target = this._max;
    }
  }

  _update() {
    this._value += (this._target - this._value) * this.easing;
    this._checkLimit();
    window.requestAnimationFrame(() => this._update());
  }

  set value(value) {
    this._target = value;
    this._checkLimit();
  }

  get value() {
    return this._value;
  }

  get target() {
    return this._target;
  }
}
