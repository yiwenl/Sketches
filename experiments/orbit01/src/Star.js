export default class Star {
  constructor(mPos, mMass) {
    this.position = mPos;
    this.velocity = [0, 0, 0];
    this.acc = [0, 0, 0];
    this.mass = mMass;
  }
}
