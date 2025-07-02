import { vec3 } from "gl-matrix";
import { squaredMagnitudeOfVector } from "./utils";

let gamma0 = [],
  gamma1 = [],
  gamma1CrossGamma0 = [],
  temp = []; //these are to minimize garbage collection
export const computeVelocityFromFilament = function (
  outVelocity,
  filamentStart,
  filamentEnd,
  position,
  a
) {
  //computes the induced velocity from a filament for a certain position
  vec3.sub(gamma0, filamentStart, position);
  vec3.sub(gamma1, filamentEnd, position);

  let dotProduct = vec3.dot(gamma0, gamma1);
  let gamma0MagnitudeSquared = squaredMagnitudeOfVector(gamma0);
  let gamma1MagnitudeSquared = squaredMagnitudeOfVector(gamma1);
  let a2 = a * a;
  vec3.cross(gamma1CrossGamma0, gamma1, gamma0);

  let numerator =
    (dotProduct - gamma0MagnitudeSquared) /
      Math.sqrt(a2 + gamma0MagnitudeSquared) +
    (dotProduct - gamma1MagnitudeSquared) /
      Math.sqrt(a2 + gamma1MagnitudeSquared);

  let denominator =
    a2 * squaredMagnitudeOfVector(vec3.sub(temp, gamma1, gamma0)) +
    squaredMagnitudeOfVector(gamma1CrossGamma0);

  return vec3.scale(outVelocity, gamma1CrossGamma0, -numerator / denominator);
};

let velocityFromFilament = [];
export const computeVelocityFromFilamentVertices = function (
  filamentVertices,
  smoothingRadius,
  position
) {
  let totalVelocity = [0, 0, 0];

  for (let i = 0; i < filamentVertices.length; ++i) {
    let startVertex = filamentVertices[i];
    let endVertex = filamentVertices[(i + 1) % filamentVertices.length];

    computeVelocityFromFilament(
      velocityFromFilament,
      startVertex,
      endVertex,
      position,
      smoothingRadius
    );
    vec3.add(totalVelocity, totalVelocity, velocityFromFilament);
  }

  return totalVelocity;
};

export const computeVelocityFromFilaments = function (
  outTotalVelocity,
  filaments,
  position
) {
  outTotalVelocity[0] = 0;
  outTotalVelocity[1] = 0;
  outTotalVelocity[2] = 0;

  for (let i = 0; i < filaments.length; ++i) {
    if (filaments[i].active) {
      let filamentVertices = filaments[i].vertices;

      let velocity = computeVelocityFromFilamentVertices(
        filamentVertices,
        filaments[i].smoothingRadius,
        position
      );
      vec3.add(outTotalVelocity, outTotalVelocity, velocity);
    }
  }

  return outTotalVelocity;
};
