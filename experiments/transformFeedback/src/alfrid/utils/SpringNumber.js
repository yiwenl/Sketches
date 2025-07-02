import Scheduler from "scheduling";

class SpringNumber {
  constructor(mValue, mSpeed = 0.1, mDecreaseRate = 0.9) {
    this._value = mValue;
    this._targetValue = mValue;
    this.speed = mSpeed;
    this.decreaseRate = mDecreaseRate;

    this._velocity = 0;

    this._efIndex = Scheduler.addEF(() => this._update());
  }

  _update() {
    const MIN_DIFF = 0.0001;
    this._checkLimit();
    if (Math.abs(this._targetValue - this._value) < MIN_DIFF) {
      this._value = this._targetValue;
      return;
    }

    this._velocity += (this._targetValue - this._value) * this.speed;

    this._value += this._velocity;
    this._velocity *= this.decreaseRate;

    if (Math.abs(this._targetValue - this._value) < MIN_DIFF) {
      this._value = this._targetValue;
    }
  }

  limit(mMin, mMax) {
    if (mMin > mMax) {
      this.limit(mMax, mMin);
      return;
    }

    this._min = mMin;
    this._max = mMax;

    this._checkLimit();
  }

  _checkLimit() {
    if (this._min !== undefined && this._targetValue < this._min) {
      this._targetValue = this._min;
    }

    if (this._max !== undefined && this._targetValue > this._max) {
      this._targetValue = this._max;
    }
  }

  destroy() {
    Scheduler.removeEF(this._efIndex);
  }

  set value(mValue) {
    this._targetValue = mValue;
  }

  get value() {
    return this._value;
  }
}

export { SpringNumber };
