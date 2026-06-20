import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAX_PARTICLE_MAX_SPEED,
  MIN_PARTICLE_MAX_SPEED,
  PARTICLE_FLOATS,
  createParticleData,
  createSeededRandom,
} from "./particleData.js";

describe("createParticleData", () => {
  it("packs one particle as position/size, velocity, color, and random values", () => {
    const data = createParticleData({
      count: 1,
      radius: 12,
      random: createSeededRandom(7),
    });

    assert.equal(data.length, PARTICLE_FLOATS);
    const x = data[0];
    const y = data[1];
    const z = data[2];
    const size = data[3];
    const vx = data[4];
    const vy = data[5];
    const vz = data[6];
    const maxSpeed = data[7];
    const r = data[8];
    const g = data[9];
    const b = data[10];
    const a = data[11];
    const rand = data.slice(12, 16);

    assert.ok(Math.hypot(x, y, z) <= 12);
    assert.ok(Math.hypot(vx, vy, vz) > 0);
    assert.ok(size >= 0.02 && size <= 0.14);
    assert.ok(maxSpeed >= MIN_PARTICLE_MAX_SPEED);
    assert.ok(maxSpeed <= MAX_PARTICLE_MAX_SPEED);
    assert.equal(r, g);
    assert.equal(g, b);
    assert.ok(r >= 0.7 && r <= 1);
    assert.equal(a, 1);
    assert.equal(rand.length, 4);
    for (const value of rand) {
      assert.ok(value >= 0);
      assert.ok(value <= 1);
    }
  });

  it("creates the requested number of particles", () => {
    const data = createParticleData({
      count: 200_000,
      radius: 18,
      random: createSeededRandom(11),
    });

    assert.equal(data.length, 200_000 * PARTICLE_FLOATS);
  });
});
