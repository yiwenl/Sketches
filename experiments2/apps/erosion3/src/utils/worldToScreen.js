import { vec4 } from "gl-matrix";

/**
 * Converts a 3D point in world space to screen space coordinates
 * @param {Array<number>} point - The 3D point as [x, y, z]
 * @param {Object} camera - The camera object (must have matrix property that returns projection * view matrix)
 * @param {number} width - Screen width in pixels
 * @param {number} height - Screen height in pixels
 * @returns {Array<number>|null} - Screen coordinates as [x, y] in pixels, or null if point is behind camera
 */
export const worldToScreen = (point, camera, width, height) => {
  // Get the combined projection * view matrix from camera
  const matrix = camera.matrix;

  if (!matrix) {
    throw new Error("Camera must have a matrix property");
  }

  // Transform point to clip space
  const pointVec4 = vec4.fromValues(point[0], point[1], point[2], 1.0);
  const clipSpace = vec4.create();
  vec4.transformMat4(clipSpace, pointVec4, matrix);

  // Perform perspective divide
  const w = clipSpace[3];

  // If w is negative or zero, point is behind camera
  if (w <= 0) {
    return null;
  }

  const ndcX = clipSpace[0] / w;
  const ndcY = clipSpace[1] / w;

  // Convert from NDC (-1 to 1) to screen coordinates (0 to width/height)
  // Note: Y is flipped because screen coordinates have origin at top-left
  const screenX = ((ndcX + 1) / 2) * width;
  const screenY = ((1 - ndcY) / 2) * height; // Flip Y axis

  return [screenX, screenY];
};
