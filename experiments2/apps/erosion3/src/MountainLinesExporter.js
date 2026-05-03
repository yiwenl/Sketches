import Constants from "./Constants";
import Config from "./Config";
import { readPixels } from "./utils/readPixels";
import { noise } from "./utils";
import { random, randomGaussian } from "@utils";
import { vec3 } from "gl-matrix";

class MountainLinesExporter {
  constructor() {
    this.hasPlotted = false;
  }

  reset() {
    this.hasPlotted = false;
  }

  generate(mHeightMap, mNormalMap) {
    if (this.hasPlotted) {
      return;
    }
    this.hasPlotted = true;

    const { MAP_SIZE } = Constants;
    const heights = readPixels(mHeightMap, true);
    const normals = readPixels(mNormalMap, false);
    const textureSize = mHeightMap.width;
    const { floor } = Math;
    let lines = [];

    const readHeight = (x, z) => {
      let _x = floor(((x + MAP_SIZE) / (2 * MAP_SIZE)) * textureSize);
      let _z = floor(((z + MAP_SIZE) / (2 * MAP_SIZE)) * textureSize);
      let index = (_x + _z * textureSize) * 4 + 1;
      return heights[index];
    };

    const readNormal = (x, z) => {
      let _x = floor(((x + MAP_SIZE) / (2 * MAP_SIZE)) * textureSize);
      let _z = floor(((z + MAP_SIZE) / (2 * MAP_SIZE)) * textureSize);
      let index = (_x + _z * textureSize) * 4;

      const nx = normals[index + 0] / 255;
      const ny = normals[index + 1] / 255;
      const nz = normals[index + 2] / 255;

      const n = [nx * 2 - 1, nz * 2 - 1, ny * 2 - 1];
      vec3.normalize(n, n);

      return n;
    };

    const generateParallelLines = () => {
      const stepSize = 0.01;
      const lineGap = 0.05;
      const depth = (MAP_SIZE * 9) / 16;
      let x = -MAP_SIZE;
      while (x <= MAP_SIZE) {
        let z = -depth;
        const line = [];
        while (z <= depth) {
          const y = readHeight(x, z);
          const normal = readNormal(x, z);
          line.push({ point: [x, y, z], normal });
          z += random(stepSize * 2.0);
        }
        lines.push(line);
        x += lineGap;
        x += random(lineGap * 0.5);
      }
    };

    const generateDiagonalLines = () => {
      const stepSize = 0.01;
      const lineGap = 0.05;
      const reverseDirection = Config.diagonalDirection;

      // Generate diagonal lines
      // reverseDirection = false: z = x + offset (bottom-left to top-right)
      // reverseDirection = true: z = -x + offset (top-left to bottom-right)
      let offset = -MAP_SIZE * 2;
      while (offset <= MAP_SIZE * 2) {
        const line = [];

        // Calculate the diagonal line based on direction
        // We'll traverse from x = -MAP_SIZE to x = MAP_SIZE
        let x = -MAP_SIZE;
        while (x <= MAP_SIZE) {
          let z = reverseDirection ? -x + offset : x + offset;

          // Only include points that are within the map bounds
          if (z >= -MAP_SIZE && z <= MAP_SIZE) {
            const y = readHeight(x, z);
            const normal = readNormal(x, z);
            line.push({ point: [x, y, z], normal });
          }

          x += random(stepSize * 2.0);
        }

        if (line.length > 0) {
          lines.push(line);
        }

        offset += lineGap;
        offset += random(lineGap * 0.5);
      }
    };

    const generateCircularLines = () => {
      const centerX = 0;
      const centerZ = 0;
      const radiusGap = 0.2 / Config.density; // Gap between circles
      const minSegmentLength = 0.005; // Minimum segment length at large radius
      const maxSegmentLength = 0.04; // Maximum segment length at small radius
      const maxRadius = MAP_SIZE * Math.sqrt(2); // Maximum radius to cover entire map (diagonal)

      // Generate concentric circles
      let radius = radiusGap;
      let indexCircle = 0;
      while (radius <= maxRadius) {
        // Calculate circumference for this circle
        const circumference = 2 * Math.PI * radius;

        // Adaptive number of segments: larger circles get more segments to maintain detail
        // Target segment length based on radius (smaller segments at larger radius)
        const targetSegmentLength =
          maxSegmentLength -
          (maxSegmentLength - minSegmentLength) * (radius / maxRadius);
        const numSegments = Math.max(
          8,
          Math.ceil(circumference / targetSegmentLength)
        );

        const line = [];
        const angleStep = (Math.PI * 2) / numSegments;
        const margin = 0.01;
        const maxSize = MAP_SIZE - margin;

        const inRange = (x, z) => {
          return x > -maxSize && x < maxSize && z > -maxSize && z < maxSize;
        };

        const { indexNoiseScale, indexNoiseStrength } = Config;
        const offset = 0.01;
        const noiseScale = 0.4;
        // Sample points around the circle
        for (let i = 0; i <= numSegments; i++) {
          const angle = i * angleStep;
          let x = centerX + radius * Math.cos(angle);
          let z = centerZ + radius * Math.sin(angle);

          // x += noise.getFBMNoise(x, 0, z, noiseScale) * offset;
          // z += noise.getFBMNoise(x, 0, z + 100, noiseScale) * offset;

          x += randomGaussian(-offset, offset);
          z += randomGaussian(-offset, offset);

          if (inRange(x, z)) {
            //   const yNext = readHeight(xNext, zNext);
            //   const normalNext = readNormal(xNext, zNext);
            //   line.push({
            //     point: [xNext, yNext, zNext],
            //     normal: normalNext,
            //   });
            // }
            // if (x > -maxSize && x < maxSize && z > -maxSize && z < maxSize) {
            const y = readHeight(x, z);
            const normal = readNormal(x, z);
            const noiseValue = noise.getFBMNoise(x, 0, z, 0.2, 8);
            line.push({
              point: [x, y, z],
              normal,
              index: indexCircle + noiseValue,
            });
          }
        }

        if (line.length > 0) {
          lines.push(line);
        }

        radius += radiusGap;
        radius += random(radiusGap * 0.3);
        indexCircle++;
      }
    };

    // Generate lines based on the selected style
    switch (Config.lineStyle) {
      case "parallel":
        generateParallelLines();
        break;
      case "diagonal":
        generateDiagonalLines();
        break;
      case "circular":
      default:
        generateCircularLines();
        break;
    }

    return lines;
  }
}

const mountainLinesExporter = new MountainLinesExporter();
export default mountainLinesExporter;
