// FboPingPong.js

import { FboArray } from "./FboArray";

class FboPingPong extends FboArray {
  constructor(width, height, params = {}, mNumTargets = 1) {
    super(2, width, height, params, mNumTargets);
  }
}

export { FboPingPong };
