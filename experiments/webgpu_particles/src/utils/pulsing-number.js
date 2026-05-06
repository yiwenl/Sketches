export class PulsingNumber {
  constructor(base = 0.5, amplitude = 0.2, frequency = 1.0) {
    this.base = base;
    this.amplitude = amplitude;
    this.frequency = frequency;
    this.value = base;
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
    // Add jitter: a mix of low-frequency sine waves to perturb the timing
    const jitter = Math.sin(this.time * 0.5) * 0.2 + Math.sin(this.time * 0.2) * 0.5;
    const x = (this.time + jitter) * this.frequency;
    
    // Heartbeat-like double peak: sharp transient + smaller secondary peak
    let pulse = Math.pow(Math.sin(x) * 0.5 + 0.5, 10.0); // Main spike
    pulse += Math.pow(Math.sin(x * 2 - 0.5) * 0.5 + 0.5, 20.0) * 0.5; // Echo
    
    this.value = this.base + pulse * this.amplitude;
    return this.value;
  }
}
