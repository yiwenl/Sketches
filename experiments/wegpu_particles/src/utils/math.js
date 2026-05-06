export class MathUtils {
  /**
   * Returns a random number based on provided arguments.
   * - random(): returns 0 to 1
   * - random(max): returns 0 to max
   * - random(min, max): returns min to max
   */
  static random(a, b) {
    if (a === undefined) return Math.random();
    if (b === undefined) return Math.random() * a;
    return Math.random() * (b - a) + a;
  }

  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  static mix(x, y, a) {
    return x + a * (y - x);
  }

  static smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  static map(value, min, max, outMin, outMax) {
    return (value - min) * (outMax - outMin) / (max - min) + outMin;
  }
  
}