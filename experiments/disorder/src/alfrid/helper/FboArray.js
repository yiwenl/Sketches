import { FrameBuffer } from "../core/FrameBuffer";

class FboArray {
  constructor(mNum, width, height, params = {}, mNumTargets = 1) {
    this._fbos = [];

    for (let i = 0; i < mNum; i++) {
      const fbo = new FrameBuffer(width, height, params, mNumTargets);
      this._fbos.push(fbo);
    }
  }

  /**
   * Swap the Fbo, taking the first one and push back to the last
   *
   */
  swap() {
    const a = this._fbos.shift();
    this._fbos.push(a);
  }

  /**
   * Return the last fbo
   *
   * @returns {FrameBuffer} the fbo
   */
  get read() {
    return this._fbos[this._fbos.length - 1];
  }

  /**
   * Return the first fbo
   *
   * @returns {FrameBuffer} the fbo
   */
  get write() {
    return this._fbos[0];
  }

  /**
   * Return all the fbo
   *
   * @returns {array} the array of fbos
   */
  get all() {
    return this._fbos;
  }
}

export { FboArray };
