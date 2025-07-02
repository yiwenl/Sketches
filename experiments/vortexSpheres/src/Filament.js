import { random } from "./utils";
import { vec3 } from "gl-matrix";

export const FILAMENT_RADIUS = 1;
export const GRAVITY = [0.0, -0.001, 0.0];
export const FRICTION = 0.98;
export const MAX_FILAMENTS = 10;
export const FRAMES_BETWEEN_EMISSIONS = 60;
export const FILAMENT_GEOMETRY_RADIUS_SCALE = 0.035;
export const SPEED_SCALE = 0.00004 * 20;
export const PARTICLE_LIFETIME = FRAMES_BETWEEN_EMISSIONS * MAX_FILAMENTS; //frames between particle respawns

const { sin, cos, PI } = Math;

import { computeVelocityFromFilaments } from "./FilamentUtils";

export class Filament {
  constructor(vertices, smoothingRadius, dummy) {
    this.vertices = vertices;
    this.active = true;

    this.vertexVelocities = [];
    for (let i = 0; i < vertices.length; ++i) {
      this.vertexVelocities[i] = [0, 0, 0];
    }

    this.smoothingRadius = smoothingRadius;
    this.dummy = dummy;
  }
}

export class FilamentSystem {
  constructor(verticesPerFilament, initialVariation, initialRadius) {
    this.filaments = [];
    this.verticesPerFilament = verticesPerFilament;
    this.filamentVariation = initialVariation;
    this.smoothingRadius = initialRadius;
    this.framesToNextEmission = FRAMES_BETWEEN_EMISSIONS;
    this.totalVelocityFromFilaments = [];
    this.filamentData = new Float32Array(
      MAX_FILAMENTS * verticesPerFilament * 4
    );

    for (let i = 0; i < MAX_FILAMENTS; ++i) {
      let dummyFilamentVertices = [];
      let radius = FILAMENT_RADIUS;

      for (let j = 0; j < verticesPerFilament; ++j) {
        let angle = (j / verticesPerFilament) * PI * 2;
        dummyFilamentVertices.push([
          cos(angle) * radius,
          999999999.0,
          sin(angle) * radius,
        ]);
      }
      this.filaments.push(
        new Filament(dummyFilamentVertices, 999999999.0, true)
      );
    }

    this.addFilament();
  }

  addFilament() {
    // console.log("addFilament");
    let filamentVertices = [];
    let radius = FILAMENT_RADIUS;
    const { verticesPerFilament, filamentVariation, smoothingRadius } = this;

    for (let j = 0; j < verticesPerFilament; ++j) {
      let angle = (j / verticesPerFilament) * PI * 2;
      filamentVertices.push([
        cos(angle) * radius + random(-1, 1) * filamentVariation,
        random(-1, 1) * filamentVariation,
        sin(angle) * radius + random(-1, 1) * filamentVariation,
      ]);
    }

    this.filaments.push(new Filament(filamentVertices, smoothingRadius, false));
    this.filaments.splice(0, 1);
  }

  simulate() {
    if (this.framesToNextEmission === 0) {
      this.addFilament();
      this.framesToNextEmission = FRAMES_BETWEEN_EMISSIONS;
    }
    this.framesToNextEmission -= 1;
    const totalVelocityFromFilaments = [0, 0, 0];

    this.filaments.forEach((filament, filamentIndex) => {
      const filamentVertices = filament.vertices;
      if (filament.dummy) return;

      if (filament.active) {
        filamentVertices.forEach((vertex, vertexIndex) => {
          computeVelocityFromFilaments(
            totalVelocityFromFilaments,
            this.filaments,
            vertex
          );

          vec3.scale(
            totalVelocityFromFilaments,
            totalVelocityFromFilaments,
            SPEED_SCALE
          );

          // update vertex position
          vec3.add(vertex, vertex, totalVelocityFromFilaments);

          // update velocity
          vec3.copy(
            filament.vertexVelocities[vertexIndex],
            totalVelocityFromFilaments
          );
        });
      } else {
        // dropping animation
        const { vertexVelocities } = filament;
        filamentVertices.forEach((vertex, j) => {
          // console.log(filament.vertexVelocities[j]);
          vec3.add(vertex, vertex, vertexVelocities[j]);
          vec3.add(vertexVelocities[j], vertexVelocities[j], GRAVITY);

          // if (
          //   vertex[1] <
          //   FILAMENT_GEOMETRY_RADIUS_SCALE * filament.smoothingRadius
          // ) {
          //   vertex[1] =
          //     FILAMENT_GEOMETRY_RADIUS_SCALE * filament.smoothingRadius;
          //   filament.vertexVelocities[j][0] *= FRICTION;
          //   filament.vertexVelocities[j][2] *= FRICTION;
          //   filament.vertexVelocities[j][1] = 0;
          // }
        });
      }
    });
  }

  setFilamentVariation(variation) {
    this.filamentVariation = variation;
  }

  setSmoothingRadius(radius) {
    this.smoothingRadius = radius;
  }

  getEmissionT() {
    return 1.0 - framesToNextEmission / FRAMES_BETWEEN_EMISSIONS;
  }

  drop() {
    for (let i = 0; i < this.filaments.length; ++i) {
      this.filaments[i].active = false;
    }
  }
}
