// bit-switch.js

class BitSwitch {
  constructor(mValue) {
    this._value = mValue;
  }

  set(mNumDigit, mValue = 1) {
    this._value = this._value;

    if (mValue === 0) {
      this._value = this._value & (0 << mNumDigit);
    } else {
      this._value = this._value | (1 << mNumDigit);
    }
  }

  get(mNumDigit) {
    let value = this._value & (1 << mNumDigit);
    value = value >> mNumDigit;

    return value === 1;
  }

  reset(mValue) {
    this._value = mValue;
  }

  get value() {
    return this._value;
  }
}

export { BitSwitch };
