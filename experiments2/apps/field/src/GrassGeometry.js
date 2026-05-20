import { GL, Mesh } from "@alfrid";
import { mix, smoothstep } from "@utils";

/**
 * Generates a grass blade mesh.
 *
 * Vertex count = (numLevels - 1) * 2 + 1
 *   numLevels = 8  →  15 vertices  (high LOD, default)
 *   numLevels = 4  →   7 vertices  (low LOD)
 *
 * @param {object} opts
 * @param {number} [opts.numLevels=8]       - number of cross-section levels
 * @param {number} [opts.lodLevel=4]        - how many top levels carry LOD positions
 * @param {number} [opts.grassBladeWidth=0.2]
 * @param {number} [opts.totalHeight=4.0]   - total blade height, shared across all LODs
 */
const generateGrassGeometry = ({
  numLevels = 8,
  lodLevel = 4,
  grassBladeWidth = 0.2,
  totalHeight = 4.0,
} = {}) => {
  const positions = [];
  const lodPositions = [];
  const uvs = [];
  const indices = [];

  const addVertex = (x, y, lodY, u, v) => {
    positions.push([x, y, 0]);
    lodPositions.push([x, lodY, 0]);
    uvs.push([u, v]);
  };

  for (let i = 0; i < numLevels; i++) {
    const numPoints = i === numLevels - 1 ? 1 : 2;

    for (let j = 0; j < numPoints; j++) {
      let x = (j - 0.5) * grassBladeWidth;
      let s = smoothstep(0, 2, i / numLevels);
      s = mix(1, 0.1, s);
      x *= s;

      if (numPoints === 1) x = 0;

      const y = (i / (numLevels - 1)) * totalHeight;

      let lodY = 0;
      if (i >= numLevels - lodLevel) {
        const p = (i - (numLevels - lodLevel)) / (lodLevel - 1);
        lodY = totalHeight * p;
      }

      let u = j / numPoints;
      if (i === numLevels - 1) u = 0.5;

      const v = i / numLevels;

      addVertex(x, y, lodY, u, v);
    }
  }

  for (let level = 0; level < numLevels - 2; level++) {
    const iStart = level * 2;
    indices.push(iStart, iStart + 1, iStart + 2);
    indices.push(iStart + 1, iStart + 3, iStart + 2);
  }

  // tip triangle
  const count = positions.length;
  indices.push(count - 3, count - 2, count - 1);

  return new Mesh()
    .bufferVertex(positions)
    .bufferTexCoord(uvs)
    .bufferData(lodPositions, "aVertexLodPosition", 3)
    .bufferIndex(indices);
};

export default generateGrassGeometry;
