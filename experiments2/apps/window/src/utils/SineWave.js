class SineWave {
  constructor(config = {}) {
    this.center = config.center ?? 0;
    this.amplitude = config.amplitude ?? 1;
    this.speed = config.speed ?? 1;
    this.phase = config.phase ?? 0;
    this.time = config.time ?? 0;
  }

  update(deltaTime = 0.01) {
    this.time += this.speed * deltaTime;
  }

  get value() {
    return this.center + Math.sin(this.time + this.phase) * this.amplitude;
  }
}

export default SineWave;

