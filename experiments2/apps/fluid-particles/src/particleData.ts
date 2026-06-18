export const PARTICLE_FLOATS = 12;

export interface ParticleDataOptions {
  count: number;
  radius: number;
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
  random = Math.random,
}: ParticleDataOptions): Float32Array {
  const data = new Float32Array(count * PARTICLE_FLOATS);
  const spawnRadius = radius * 0.82;

  for (let i = 0; i < count; i++) {
    const base = i * PARTICLE_FLOATS;
    const direction = randomUnitVector(random);
    const r = Math.cbrt(random()) * spawnRadius;
    const x = direction[0] * r;
    const y = direction[1] * r;
    const z = direction[2] * r;

    const tangent = normalize([
      -direction[2] + (random() - 0.5) * 0.2,
      (random() - 0.5) * 0.3,
      direction[0] + (random() - 0.5) * 0.2,
    ]);
    const speed = 0.018 + random() * 0.024;
    const grey = 0.7 + random() * 0.3;

    data[base + 0] = x;
    data[base + 1] = y;
    data[base + 2] = z;
    data[base + 3] = (0.018 + random() * 0.042) * 2;
    data[base + 4] = tangent[0] * speed;
    data[base + 5] = tangent[1] * speed;
    data[base + 6] = tangent[2] * speed;
    data[base + 7] = random();
    data[base + 8] = grey;
    data[base + 9] = grey;
    data[base + 10] = grey;
    data[base + 11] = 1;
  }

  return data;
}

function randomUnitVector(random: () => number): [number, number, number] {
  const z = random() * 2 - 1;
  const theta = random() * Math.PI * 2;
  const radius = Math.sqrt(Math.max(0, 1 - z * z));
  return [Math.cos(theta) * radius, z, Math.sin(theta) * radius];
}

function normalize(v: [number, number, number]): [number, number, number] {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}
