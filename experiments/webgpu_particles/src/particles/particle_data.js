import { vec3 } from "gl-matrix";
import { MathUtils } from "../utils/math.js";

export class ParticleData {
  constructor(numParticles = 800000, config = { sphereRadius: 4, particleScale: 0.4 }) {
    this.numParticles = numParticles;
    this.config = config;

    // Interleaved layout aligned for WGSL storage buffer (std430 like):
    // Position (3) + Speed (1) | Velocity (3) + Life (1) | Color (3) + Size (1) | Extra (3) + LifeDecrease (1) | Origin (3) + Pad (1) = 20 floats
    this.floatsPerParticle = 20;
    this.byteStride = this.floatsPerParticle * 4;
    this.data = new Float32Array(this.numParticles * this.floatsPerParticle);

    this.init();
  }

  init() {
    const tempVec = vec3.create();

    let ringSize = 0.5;
    const c = [0, 0, 0];

    for (let i = 0; i < this.numParticles; i++) {
      const offset = i * this.floatsPerParticle;
      const r = this.config.sphereRadius * MathUtils.random(0.5, 1);

      let p = [0, ringSize, 0]
      let a = MathUtils.random(0, Math.PI * 2);
      vec3.rotateX(p, p, c, a);
      p[2] += r;
      a = MathUtils.random(0, Math.PI * 2);
      vec3.rotateY(p, p, c, a);

      // Position: Random on a ring (XZ plane)
      const angle = MathUtils.random(0, Math.PI * 2);

      this.data[offset + 0] = p[0];
      this.data[offset + 1] = p[1];
      this.data[offset + 2] = p[2];
      // Speed
      this.data[offset + 3] = MathUtils.random(0.2, 0.5);

      // Velocity: Random direction
      vec3.random(tempVec, 0.1);
      this.data[offset + 4] = tempVec[0];
      this.data[offset + 5] = tempVec[1];
      this.data[offset + 6] = tempVec[2];

      // Life: Starts at random 0.5 to 1.0 to stagger resets
      this.data[offset + 7] = MathUtils.random(0.5, 1.0);

      // Color: Grayscale
      const grey = MathUtils.random(.5, 1);
      this.data[offset + 8] = grey; // r
      this.data[offset + 9] = grey; // g
      this.data[offset + 10] = grey; // b

      // Size: Random 
      this.data[offset + 11] = MathUtils.random(0.05, 0.25) * this.config.particleScale; // size

      // Extra: Random Vec3 (for variety)
      this.data[offset + 12] = MathUtils.random(); // Extra.x: Scales noise position
      this.data[offset + 13] = MathUtils.random();         // Extra.y
      this.data[offset + 14] = MathUtils.random();         // Extra.z

      // LifeDecrease: Random value between 0.3 and 0.5
      this.data[offset + 15] = MathUtils.random(0.3, 0.5);

      // Origin Position (copy of initial Position)
      this.data[offset + 16] = this.data[offset + 0];
      this.data[offset + 17] = this.data[offset + 1];
      this.data[offset + 18] = this.data[offset + 2];
      // Pad at 19
    }
  }

  get buffer() {
    return this.data;
  }
}
