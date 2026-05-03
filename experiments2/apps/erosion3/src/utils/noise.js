import { createNoise3D } from "simplex-noise";

/**
 * 3D Noise utility class for generating position-based noise using simplex-noise
 */
class Noise {
  constructor(seed = null) {
    // Create a seeded PRNG if seed is provided, otherwise use Math.random
    let prng = Math.random;
    if (seed !== null && seed !== undefined) {
      // Simple seeded PRNG for simplex-noise
      // This is a basic implementation - for better seeding, consider using 'alea' package
      let seedValue =
        typeof seed === "number"
          ? seed
          : seed
              .toString()
              .split("")
              .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      prng = () => {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
      };
    }
    this.noise3D = createNoise3D(prng);
  }

  /**
   * Generate noise value based on position with scale and strength
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @param {number} noiseScale - Scale factor for noise coordinates (higher = larger features)
   * @param {number} noiseStrength - Strength of the noise (multiplier for the noise value)
   * @returns {number} Noise value scaled by strength
   */
  getNoise(x, y, z, noiseScale = 1.0, noiseStrength = 1.0) {
    const scaledX = x * noiseScale;
    const scaledY = y * noiseScale;
    const scaledZ = z * noiseScale;
    const noiseValue = this.noise3D(scaledX, scaledY, scaledZ);
    return noiseValue * noiseStrength;
  }

  /**
   * Generate FBM (Fractal Brownian Motion) noise for more organic patterns
   * Combines multiple octaves of noise at different frequencies and amplitudes
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} z - Z coordinate
   * @param {number} noiseScale - Base scale factor for noise coordinates
   * @param {number} noiseStrength - Strength of the noise (multiplier for the final value)
   * @param {number} octaves - Number of octaves to combine (default: 4)
   * @param {number} frequencyMultiplier - Frequency multiplier between octaves (default: 2.0)
   * @param {number} amplitudeMultiplier - Amplitude multiplier between octaves (default: 0.5)
   * @returns {number} FBM noise value scaled by strength
   */
  getFBMNoise(
    x,
    y,
    z,
    noiseScale = 1.0,
    noiseStrength = 1.0,
    octaves = 4,
    frequencyMultiplier = 2.0,
    amplitudeMultiplier = 0.5
  ) {
    let value = 0.0;
    let amplitude = 1.0;
    let frequency = 1.0;
    let maxValue = 0.0; // Used for normalization

    // Rotation matrix to avoid directional artifacts
    // This rotates the noise space slightly for each octave
    const rotMatrix = [
      [0.0, 0.8, 0.6],
      [-0.8, 0.36, -0.48],
      [-0.6, -0.48, 0.64],
    ];

    let px = x * noiseScale;
    let py = y * noiseScale;
    let pz = z * noiseScale;

    for (let i = 0; i < octaves; i++) {
      const noiseValue = this.noise3D(
        px * frequency,
        py * frequency,
        pz * frequency
      );
      value += amplitude * noiseValue;
      maxValue += amplitude;

      // Update frequency and amplitude for next octave
      frequency *= frequencyMultiplier;
      amplitude *= amplitudeMultiplier;

      // Rotate the position slightly to avoid directional artifacts
      const newX =
        rotMatrix[0][0] * px + rotMatrix[0][1] * py + rotMatrix[0][2] * pz;
      const newY =
        rotMatrix[1][0] * px + rotMatrix[1][1] * py + rotMatrix[1][2] * pz;
      const newZ =
        rotMatrix[2][0] * px + rotMatrix[2][1] * py + rotMatrix[2][2] * pz;
      px = newX;
      py = newY;
      pz = newZ;
    }

    // Normalize the value to keep it in a reasonable range
    // and apply strength
    return (value / maxValue) * noiseStrength;
  }
}

// Export a default instance
const noise = new Noise();
export default noise;
export { Noise };
