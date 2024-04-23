import { vec3, mat3 } from "gl-matrix";

// Define the square's properties
const squareCenter = vec3.fromValues(1, 1, 1); // center of the square
const squareNormal = vec3.fromValues(0, 0, 1); // normal to the square
const squareSideLength = 2; // side length of the square

// Define local axes on the square (make sure they are perpendicular and normalized)
const localX = vec3.fromValues(1, 0, 0); // local x-axis on the square
const localY = vec3.fromValues(0, 1, 0); // local y-axis on the square

// Define the point
const point = vec3.fromValues(1.5, 1.5, 1); // the point to project

// Function to project a point onto the square's plane and calculate its percentage position
export function calculatePercentagePosition(
  point,
  center,
  normal,
  localX,
  localY,
  sideLength
) {
  // Project point onto the plane
  let pointMinusCenter = vec3.subtract(vec3.create(), point, center);
  let distToPlane = vec3.dot(pointMinusCenter, normal);
  let projection = vec3.subtract(
    vec3.create(),
    point,
    vec3.scale(vec3.create(), normal, distToPlane)
  );

  // Transform point to the local coordinate system of the square
  let matrix = mat3.fromValues(
    localX[0],
    localY[0],
    normal[0],
    localX[1],
    localY[1],
    normal[1],
    localX[2],
    localY[2],
    normal[2]
  );
  let localCoords = vec3.transformMat3(
    vec3.create(),
    vec3.subtract(vec3.create(), projection, center),
    mat3.invert(mat3.create(), matrix)
  );

  // Convert local coordinates to percentage
  const xPercentage = (localCoords[0] / sideLength + 0.5) * 100;
  const yPercentage = (localCoords[1] / sideLength + 0.5) * 100;

  return { xPercentage, yPercentage };
}
