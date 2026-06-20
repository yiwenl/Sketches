import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PARTICLE_GRID_SIZE,
  WIRE_HISTORY_LENGTH,
  WIRE_PARTICLE_COUNT,
  WIRE_SIDES,
  createWireGeometry,
  createWireHistoryData,
  createWireHistoryLength,
  createWireHistoryInvocationCount,
  createWireParticleCount,
  getWireHistoryIndex,
} from "./wireData.js";
import { PARTICLE_FLOATS } from "./particleData.js";

describe("wireData", () => {
  it("uses a 64x64 particle field and a 12x12 history ring", () => {
    assert.equal(PARTICLE_GRID_SIZE, 64);
    assert.equal(WIRE_PARTICLE_COUNT, 64 * 64);
    assert.equal(WIRE_HISTORY_LENGTH, 12 * 12);
    assert.equal(WIRE_SIDES, 3);
  });

  it("derives particle and history counts from control values", () => {
    assert.equal(createWireParticleCount(32), 32 * 32);
    assert.equal(createWireParticleCount(96), 96 * 96);
    assert.equal(createWireHistoryLength(14), 14 * 14);
    assert.equal(createWireHistoryLength(16), 16 * 16);
  });

  it("dispatches history-wide passes across every particle in every history slot", () => {
    assert.equal(
      createWireHistoryInvocationCount({
        particleCount: 64 * 64,
        historyLength: 12 * 12,
      }),
      64 * 64 * 12 * 12
    );
  });

  it("packs history data as repeated vec4 positions for every slot", () => {
    const particles = new Float32Array(PARTICLE_FLOATS * 2);
    particles.set([1, 2, 3, 0.25], 0);
    particles.set([9, 8, 7, 0.5], PARTICLE_FLOATS);

    const history = createWireHistoryData({
      particles,
      particleCount: 2,
      historyLength: 3,
    });

    assert.deepEqual(Array.from(history), [
      1, 2, 3, 1, 9, 8, 7, 1,
      1, 2, 3, 1, 9, 8, 7, 1,
      1, 2, 3, 1, 9, 8, 7, 1,
    ]);
  });

  it("resolves newest-first history slots from a write cursor", () => {
    assert.equal(
      getWireHistoryIndex({
        nodeIndex: 0,
        particleIndex: 5,
        writeSlot: 7,
        historyLength: 12,
        particleCount: 10,
      }),
      75
    );
    assert.equal(
      getWireHistoryIndex({
        nodeIndex: 2,
        particleIndex: 5,
        writeSlot: 1,
        historyLength: 12,
        particleCount: 10,
      }),
      115
    );
  });

  it("creates triangle-list tube geometry with one instance-driven wire per particle", () => {
    const geometry = createWireGeometry({
      historyLength: 4,
      sides: 3,
    });

    assert.equal(geometry.vertexCount, (4 - 1) * 3 * 6);
    assert.equal(geometry.positions.length, geometry.vertexCount * 3);
    assert.equal(geometry.nodeSides.length, geometry.vertexCount * 2);
    assert.deepEqual(Array.from(geometry.nodeSides.slice(0, 12)), [
      0, 0,
      1, 0,
      1, 1,
      0, 0,
      1, 1,
      0, 1,
    ]);
  });
});
