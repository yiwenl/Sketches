export const PARTICLE_FLOATS = 16;
export const MIN_PARTICLE_MAX_SPEED = 9;
export const MAX_PARTICLE_MAX_SPEED = 11;

export interface ParticleDataOptions {
  count: number;
  radius: number;
  baseScale?: number;
  random?: () => number;
}

export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function createParticleData({
  count,
  radius,
  baseScale = 1,
  random = Math.random,
}: ParticleDataOptions): Float32Array {
  const data = new Float32Array(count * PARTICLE_FLOATS);
  const spawnRadius = radius * 0.82;

  for (let i = 0; i < count; i++) {
    const base = i * PARTICLE_FLOATS;
    const r = Math.sqrt(random()) * spawnRadius;
    const theta = random() * Math.PI * 2;
    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r;
    const z = (random() - 0.5) * 0.2; // Slight random noise on Z

    const tangent = normalize([
      -Math.sin(theta) + (random() - 0.5) * 0.2,
      Math.cos(theta) + (random() - 0.5) * 0.2,
      (random() - 0.5) * 0.1,
    ]);
    const speed = 0.018 + random() * 0.024;
    const grey = 0.7 + random() * 0.3;

    data[base + 0] = x;
    data[base + 1] = y;
    data[base + 2] = z;
    data[base + 3] = (0.01 + random() * 0.06) * 2 * baseScale;
    data[base + 4] = tangent[0] * speed;
    data[base + 5] = tangent[1] * speed;
    data[base + 6] = tangent[2] * speed;
    data[base + 7] =
      MIN_PARTICLE_MAX_SPEED +
      random() * (MAX_PARTICLE_MAX_SPEED - MIN_PARTICLE_MAX_SPEED);
    data[base + 8] = grey;
    data[base + 9] = grey;
    data[base + 10] = grey;
    data[base + 11] = 1;
    data[base + 12] = random();
    data[base + 13] = random();
    data[base + 14] = random();
    data[base + 15] = random();
  }

  return data;
}


function normalize(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}
