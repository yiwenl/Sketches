import Constants from "./Constants";
import { readPixels } from "./utils/readPixels";

class PlotGenerator {
  constructor() {
    this.hasPlotted = false;
  }

  generate(mHeightMap) {
    if (this.hasPlotted) {
      return;
    }
    this.hasPlotted = true;
    console.log("Generating plots...");

    const { MAP_SIZE } = Constants;
    const pixels = readPixels(mHeightMap);
    const textureSize = mHeightMap.width;
    const { floor } = Math;
    const lines = [];

    const readHeight = (x, z) => {
      let _x = floor(((x + MAP_SIZE) / (2 * MAP_SIZE)) * textureSize);
      let _z = floor(((z + MAP_SIZE) / (2 * MAP_SIZE)) * textureSize);
      let index = (_x + _z * textureSize) * 4 + 1;
      return pixels[index];
    };

    const stepSize = 0.005;
    const lineGap = 0.02;
    const depth = (MAP_SIZE * 9) / 16;

    for (let x = -MAP_SIZE; x <= MAP_SIZE; x += lineGap) {
      const line = [];
      for (let z = -depth; z <= depth; z += stepSize) {
        const y = readHeight(x, z);
        line.push([x, y, z]);
      }
      lines.push(line);
    }

    return lines;
  }
}

const plotGenerator = new PlotGenerator();
export default plotGenerator;
