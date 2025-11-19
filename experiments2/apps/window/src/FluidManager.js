import FluidSimulation from "./fluid-sim";
import Scheduler from "scheduling";
import { random, pick } from "@utils";
import { vec2 } from "gl-matrix";
import SineWave from "./utils/SineWave";

let v = [1, 0];

class ForcePoint {
  constructor(x) {
    // Store original values
    this._originalX = x;
    const originalRadius = random(1, 1.5);

    this.strength = random(0.5, 1);
    this.noise = random(0.1, 0.3);
    this.inverted = false;

    // Animation parameters
    const speed = random(0.1, 0.3);
    const rotationSpeed = random(0.1, 0.3) * 2;
    const xAmplitude = random(0.01, 0.03);
    const yAmplitude = random(0.05, 0.1);
    const maxRotation = random(0.5, 1.5);
    const initialRotationTime = random(100);
    const initialYTime = random(100);
    const initialXTime = random(100);
    const initialRadiusTime = random(100);

    // X position sine wave (small amplitude to stay near original)
    this._xWave = new SineWave({
      center: x,
      amplitude: xAmplitude,
      speed: speed,
      time: initialXTime,
    });

    // Y position sine wave
    this._yWave = new SineWave({
      center: 0.5,
      amplitude: yAmplitude,
      speed: speed,
      time: initialYTime,
    });

    // Radius sine wave (oscillate around original radius)
    const radiusAmplitude = random(0.02, 0.4);
    this._radiusWave = new SineWave({
      center: originalRadius,
      amplitude: radiusAmplitude,
      speed: speed,
      time: initialRadiusTime,
    });

    // Rotation cosine wave (using phase offset for cosine)
    this._rotationWave = new SineWave({
      center: 0,
      amplitude: maxRotation,
      speed: rotationSpeed,
      phase: Math.PI / 2, // Phase offset to make it cosine
      time: initialRotationTime,
    });
  }

  update() {
    this._xWave.update(0.01);
    this._yWave.update(0.01);
    this._radiusWave.update(0.01);
    this._rotationWave.update(0.01);
  }

  get x() {
    return this._xWave.value;
  }

  get y() {
    return this._yWave.value;
  }

  get radius() {
    return this._radiusWave.value;
  }

  get rotation() {
    return this._rotationWave.value;
  }

  get pos() {
    return [this.x, this.y];
  }

  get dir() {
    v = [this.inverted ? -1 : 1, 0];
    vec2.rotate(v, v, [0, 0], this.rotation);
    return v;
  }
}

class FluidManager {
  init() {
    const DISSIPATION = 0.99;
    this._fluid = new FluidSimulation({
      DENSITY_DISSIPATION: DISSIPATION,
      VELOCITY_DISSIPATION: DISSIPATION,
      PRESSURE_DISSIPATION: DISSIPATION,
    });

    this._forcePoints = [];
    const baseStrength = 20;
    const numPoints = 20;
    const n = 1 / numPoints; // Interval between points on x-axis

    // Create points at regular intervals: n, 2*n, 3*n, ... up to 1.0
    for (let x = n + 0.5 / numPoints; x < 1.0; x += n) {
      const point = new ForcePoint(x);
      point.strength *= baseStrength / numPoints;
      this._forcePoints.push(point);
    }

    let i = 5;
    while (i--) {
      const point = pick(this._forcePoints);
      point.inverted = !point.inverted;
      point.strength *= 0.5;
    }

    Scheduler.addEF(() => this.update());
  }

  update() {
    this._forcePoints.forEach((point) => {
      point.update();
      const { pos, dir, radius, strength, noise } = point;
      this._fluid.updateFlow(pos, dir, strength, radius, noise);
    });
    this._fluid.update();
  }

  get velocity() {
    return this._fluid.velocity;
  }

  get density() {
    return this._fluid.density;
  }
}

const manager = new FluidManager();

export default manager;
