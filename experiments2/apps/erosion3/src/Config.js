export default {
  numDroplets: 128,
  numSteps: 300,
  splatScale: 1.2996,
  minSlope: 0.04632,
  showDroplets: false,
  showErosion: false,
  useSimulation: true,
  noiseStrength: 0.5,
  useTargetSize: false,
  autoSave: false,
  margin: 10,
  background: [0.086, 0.086, 0.086],
  gravity: 6,
  inertia: 0.05,
  evaporationRate: 1,
  erosionRate: 0.0262,
  depositionRate: 5,
  linesThreshold: 0.25,
  diagonalDirection: false, // false: bottom-left to top-right, true: top-left to bottom-right
  lineStyle: "circular", // "parallel", "diagonal", "circular"
  indexNoiseScale: 0.1, // Scale factor for index noise coordinates
  indexNoiseStrength: 0.5, // Strength of index noise
  density: 10, // Density of circular lines (higher = more lines)
  lightRotationY: 0.5, // Rotation Y angle for the light
  lightRotationX: 0.0, // Rotation X angle for the light
  spotLightAngle: 0.5, // Spot light cone angle in radians
  spotLightFalloff: 2.0, // Spot light falloff exponent (higher = sharper falloff)
};
