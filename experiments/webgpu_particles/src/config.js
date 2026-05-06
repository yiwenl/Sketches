const devMode = false;
const multiplier = devMode ? 1 : 2;

export const Config = {
  // Particles
  numParticles: 250000 * multiplier,
  sphereRadius: 4,
  particleScale: 0.4,
  maxRadius: 10,
  noiseScale: 0.002,
  forceStrength: 0.01,
  speedScale: 0.3,
  maxSpeed: 0.3,
  maxSpeedPulseAmplitude: 0.2,
  maxSpeedPulseFrequency: 3.0,
  glowIntensity: 0.0005,

  // Fluid Simulation
  gridRes: 32 * multiplier,
  velocityDecay: 0.98,
  pressureDecay: 0.95,
  densityDecay: 0.95,
  vorticity: 6.0,
  pressureIterations: 40,

  // Lighting & Background
  floorLightIntensity: 0.02,
  filmGrainIntensity: 0.05,
  vignetteIntensity: 0.75,

  // Auto Force (Infinity Sign)
  autoForceIntensity: 0.25,
  autoForceSpeed: 2,
  autoForceScale: 1,

  // Debug
  showDebug: false,
  targetFPS: 60,
};