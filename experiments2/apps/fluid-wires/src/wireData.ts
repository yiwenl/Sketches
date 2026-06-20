import { PARTICLE_FLOATS } from "./particleData.js";

export const PARTICLE_GRID_SIZE = 64;
export const WIRE_PARTICLE_COUNT = PARTICLE_GRID_SIZE * PARTICLE_GRID_SIZE;
export const WIRE_TILE_COUNT = 12;
export const WIRE_HISTORY_LENGTH = WIRE_TILE_COUNT * WIRE_TILE_COUNT;
export const WIRE_SIDES = 3;
export const WIRE_RADIUS = 0.025;
export const WIRE_DISTANCE_SKIP = 0.4;

export function createWireParticleCount(gridSize: number): number {
  return gridSize * gridSize;
}

export function createWireHistoryLength(tileCount: number): number {
  return tileCount * tileCount;
}

export function createWireHistoryInvocationCount({
  particleCount,
  historyLength,
}: {
  particleCount: number;
  historyLength: number;
}): number {
  return particleCount * historyLength;
}

export interface WireHistoryDataOptions {
  particles: Float32Array;
  particleCount: number;
  historyLength: number;
}

export interface WireHistoryIndexOptions {
  nodeIndex: number;
  particleIndex: number;
  writeSlot: number;
  historyLength: number;
  particleCount: number;
}

export interface WireGeometryOptions {
  historyLength: number;
  sides: number;
}

export interface WireGeometryData {
  positions: Float32Array;
  nodeSides: Float32Array;
  vertexCount: number;
}

export function createWireHistoryData({
  particles,
  particleCount,
  historyLength,
}: WireHistoryDataOptions): Float32Array {
  const history = new Float32Array(particleCount * historyLength * 4);

  for (let slot = 0; slot < historyLength; slot++) {
    for (let i = 0; i < particleCount; i++) {
      const particleBase = i * PARTICLE_FLOATS;
      const historyBase = (slot * particleCount + i) * 4;
      history[historyBase + 0] = particles[particleBase + 0];
      history[historyBase + 1] = particles[particleBase + 1];
      history[historyBase + 2] = particles[particleBase + 2];
      history[historyBase + 3] = 1;
    }
  }

  return history;
}

export function getWireHistoryIndex({
  nodeIndex,
  particleIndex,
  writeSlot,
  historyLength,
  particleCount,
}: WireHistoryIndexOptions): number {
  const slot =
    (((writeSlot - nodeIndex) % historyLength) + historyLength) %
    historyLength;
  return slot * particleCount + particleIndex;
}

export function createWireGeometry({
  historyLength,
  sides,
}: WireGeometryOptions): WireGeometryData {
  const segmentCount = Math.max(0, historyLength - 1);
  const vertexCount = segmentCount * sides * 6;
  const positions = new Float32Array(vertexCount * 3);
  const nodeSides = new Float32Array(vertexCount * 2);
  let cursor = 0;

  const pushVertex = (node: number, side: number) => {
    positions[cursor * 3 + 0] = node;
    positions[cursor * 3 + 1] = side;
    positions[cursor * 3 + 2] = 0;
    nodeSides[cursor * 2 + 0] = node;
    nodeSides[cursor * 2 + 1] = side;
    cursor++;
  };

  for (let node = 0; node < segmentCount; node++) {
    for (let side = 0; side < sides; side++) {
      const nextSide = (side + 1) % sides;
      pushVertex(node, side);
      pushVertex(node + 1, side);
      pushVertex(node + 1, nextSide);
      pushVertex(node, side);
      pushVertex(node + 1, nextSide);
      pushVertex(node, nextSide);
    }
  }

  return {
    positions,
    nodeSides,
    vertexCount,
  };
}
