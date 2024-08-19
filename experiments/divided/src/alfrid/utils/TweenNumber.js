import Scheduler from "scheduling";

const Easing = {
  Linear: {
    None(k) {
      return k;
    },
  },
  Quadratic: {
    In(k) {
      return k * k;
    },
    Out(k) {
      return k * (2 - k);
    },
    InOut(k) {
      if ((k *= 2) < 1) {
        return 0.5 * k * k;
      }
      return -0.5 * (--k * (k - 2) - 1);
    },
  },
  Cubic: {
    In(k) {
      return k * k * k;
    },
    Out(k) {
      return --k * k * k + 1;
    },
    InOut(k) {
      if ((k *= 2) < 1) {
        return 0.5 * k * k * k;
      }
      return 0.5 * ((k -= 2) * k * k + 2);
    },
  },
  Quartic: {
    In(k) {
      return k * k * k * k;
    },
    Out(k) {
      return 1 - --k * k * k * k;
    },
    InOut(k) {
      if ((k *= 2) < 1) {
        return 0.5 * k * k * k * k;
      }
      return -0.5 * ((k -= 2) * k * k * k - 2);
    },
  },
  Quintic: {
    In(k) {
      return k * k * k * k * k;
    },
    Out(k) {
      return --k * k * k * k * k + 1;
    },
    InOut(k) {
      if ((k *= 2) < 1) {
        return 0.5 * k * k * k * k * k;
      }
      return 0.5 * ((k -= 2) * k * k * k * k + 2);
    },
  },
  Sinusoidal: {
    In(k) {
      return 1 - Math.cos((k * Math.PI) / 2);
    },
    Out(k) {
      return Math.sin((k * Math.PI) / 2);
    },
    InOut(k) {
      return 0.5 * (1 - Math.cos(Math.PI * k));
    },
  },
  Exponential: {
    In(k) {
      return k === 0 ? 0 : Math.pow(1024, k - 1);
    },
    Out(k) {
      return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
    },
    InOut(k) {
      if (k === 0) {
        return 0;
      }
      if (k === 1) {
        return 1;
      }
      if ((k *= 2) < 1) {
        return 0.5 * Math.pow(1024, k - 1);
      }
      return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
    },
  },
  Circular: {
    In(k) {
      return 1 - Math.sqrt(1 - k * k);
    },
    Out(k) {
      return Math.sqrt(1 - --k * k);
    },
    InOut(k) {
      if ((k *= 2) < 1) {
        return -0.5 * (Math.sqrt(1 - k * k) - 1);
      }
      return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
    },
  },
  Elastic: {
    In(k) {
      let s;
      let a = 0.1;
      const p = 0.4;
      if (k === 0) {
        return 0;
      }
      if (k === 1) {
        return 1;
      }
      if (!a || a < 1) {
        a = 1;
        s = p / 4;
      } else {
        s = (p * Math.asin(1 / a)) / (2 * Math.PI);
      }
      return -(
        a *
        Math.pow(2, 10 * (k -= 1)) *
        Math.sin(((k - s) * (2 * Math.PI)) / p)
      );
    },
    Out(k) {
      let s;
      let a = 0.1;
      const p = 0.4;
      if (k === 0) {
        return 0;
      }
      if (k === 1) {
        return 1;
      }
      if (!a || a < 1) {
        a = 1;
        s = p / 4;
      } else {
        s = (p * Math.asin(1 / a)) / (2 * Math.PI);
      }
      return (
        a * Math.pow(2, -10 * k) * Math.sin(((k - s) * (2 * Math.PI)) / p) + 1
      );
    },
    InOut(k) {
      let s;
      let a = 0.1;
      const p = 0.4;
      if (k === 0) {
        return 0;
      }
      if (k === 1) {
        return 1;
      }
      if (!a || a < 1) {
        a = 1;
        s = p / 4;
      } else {
        s = (p * Math.asin(1 / a)) / (2 * Math.PI);
      }
      if ((k *= 2) < 1) {
        return (
          -0.5 *
          (a *
            Math.pow(2, 10 * (k -= 1)) *
            Math.sin(((k - s) * (2 * Math.PI)) / p))
        );
      }
      return (
        a *
          Math.pow(2, -10 * (k -= 1)) *
          Math.sin(((k - s) * (2 * Math.PI)) / p) *
          0.5 +
        1
      );
    },
  },
  Back: {
    In(k) {
      const s = 1.70158;
      return k * k * ((s + 1) * k - s);
    },
    Out(k) {
      const s = 1.70158;
      return --k * k * ((s + 1) * k + s) + 1;
    },
    InOut(k) {
      const s = 1.70158 * 1.525;
      if ((k *= 2) < 1) {
        return 0.5 * (k * k * ((s + 1) * k - s));
      }
      return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
    },
  },
  Bounce: {
    in(k) {
      return 1 - Easing.Bounce.out(1 - k);
    },
    out(k) {
      if (k < 1 / 2.75) {
        return 7.5625 * k * k;
      } else if (k < 2 / 2.75) {
        return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
      } else if (k < 2.5 / 2.75) {
        return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
      } else {
        return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
      }
    },
    inOut(k) {
      if (k < 0.5) {
        return Easing.Bounce.in(k * 2) * 0.5;
      }
      return Easing.Bounce.out(k * 2 - 1) * 0.5 + 0.5;
    },
  },
};

function getFunc(mEasing) {
  switch (mEasing) {
    default:
    case "linear":
      return Easing.Linear.None;
    case "expIn":
      return Easing.Exponential.In;
    case "expOut":
      return Easing.Exponential.Out;
    case "expInOut":
      return Easing.Exponential.InOut;

    case "cubicIn":
      return Easing.Cubic.In;
    case "cubicOut":
      return Easing.Cubic.Out;
    case "cubicInOut":
      return Easing.Cubic.InOut;

    case "quarticIn":
      return Easing.Quartic.In;
    case "quarticOut":
      return Easing.Quartic.Out;
    case "quarticInOut":
      return Easing.Quartic.InOut;

    case "quinticIn":
      return Easing.Quintic.In;
    case "quinticOut":
      return Easing.Quintic.Out;
    case "quinticInOut":
      return Easing.Quintic.InOut;

    case "sinusoidalIn":
      return Easing.Sinusoidal.In;
    case "sinusoidalOut":
      return Easing.Sinusoidal.Out;
    case "sinusoidalInOut":
      return Easing.Sinusoidal.InOut;

    case "circularIn":
      return Easing.Circular.In;
    case "circularOut":
      return Easing.Circular.Out;
    case "circularInOut":
      return Easing.Circular.InOut;

    case "elasticIn":
      return Easing.Elastic.In;
    case "elasticOut":
      return Easing.Elastic.Out;
    case "elasticInOut":
      return Easing.Elastic.InOut;

    case "backIn":
      return Easing.Back.In;
    case "backOut":
      return Easing.Back.Out;
    case "backInOut":
      return Easing.Back.InOut;

    case "bounceIn":
      return Easing.Bounce.in;
    case "bounceOut":
      return Easing.Bounce.out;
    case "bounceInOut":
      return Easing.Bounce.inOut;
  }
}

class TweenNumber {
  constructor(mValue, mEasing = "expOut", mSpeed = 0.01) {
    this._value = mValue;
    this._startValue = mValue;
    this._targetValue = mValue;
    this._counter = 1;
    this.speed = mSpeed;
    this.easing = mEasing;
    this._needUpdate = true;

    this._efIndex = Scheduler.addEF(() => this._update());
  }

  _update() {
    let newCounter = this._counter + this.speed;
    if (newCounter > 1) {
      newCounter = 1;
    }
    if (this._counter === newCounter) {
      this._needUpdate = false;
      return;
    }

    this._counter = newCounter;
    this._needUpdate = true;
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

  setTo(mValue) {
    this._value = mValue;
    this._targetValue = mValue;
    this._counter = 1;
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

  //	GETTERS / SETTERS

  set value(mValue) {
    this._startValue = this._value;
    this._targetValue = mValue;
    this._checkLimit();
    this._counter = 0;
  }

  get value() {
    if (this._needUpdate) {
      const f = getFunc(this.easing);
      const p = f(this._counter);
      this._value =
        this._startValue + p * (this._targetValue - this._startValue);
      this._needUpdate = false;
    }
    return this._value;
  }

  get targetValue() {
    return this._targetValue;
  }
}

export { TweenNumber };
