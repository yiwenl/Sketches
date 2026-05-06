import { vec3, vec4, mat4 } from 'gl-matrix';

export class Ray {
  constructor(origin = [0, 0, 0], direction = [0, 0, -1]) {
    this.origin = vec3.clone(origin);
    this.direction = vec3.normalize(vec3.create(), direction);
  }

  /**
   * Creates a ray from screen coordinates
   * @param {number} ndcX - Normalized device x coordinate (-1 to 1)
   * @param {number} ndcY - Normalized device y coordinate (-1 to 1)
   * @param {Camera} camera - Camera object with viewProjectionMatrix
   */
  static fromScreen(ndcX, ndcY, camera) {
    const invVP = mat4.invert(mat4.create(), camera.viewProjectionMatrix);
    
    // Near point in world space
    const nearPoint = vec4.fromValues(ndcX, ndcY, 0.0, 1.0);
    vec4.transformMat4(nearPoint, nearPoint, invVP);
    vec3.scale(nearPoint, nearPoint, 1.0 / nearPoint[3]);

    // Far point in world space
    const farPoint = vec4.fromValues(ndcX, ndcY, 1.0, 1.0);
    vec4.transformMat4(farPoint, farPoint, invVP);
    vec3.scale(farPoint, farPoint, 1.0 / farPoint[3]);

    const origin = vec3.clone(nearPoint);
    const direction = vec3.subtract(vec3.create(), farPoint, nearPoint);
    vec3.normalize(direction, direction);

    return new Ray(origin, direction);
  }
}

export class Plane {
  constructor(normal = [0, 1, 0], constant = 0) {
    this.normal = vec3.normalize(vec3.create(), normal);
    this.constant = constant;
  }

  /**
   * Intersects a ray with the plane
   * @param {Ray} ray 
   * @returns {number|null} distance t or null
   */
  intersectRay(ray) {
    const denom = vec3.dot(this.normal, ray.direction);
    if (Math.abs(denom) > 1e-6) {
      const t = (this.constant - vec3.dot(this.normal, ray.origin)) / denom;
      return t >= 0 ? t : null;
    }
    return null;
  }

  /**
   * Gets the point on the ray at distance t
   * @param {Ray} ray 
   * @param {number} t 
   * @returns {vec3}
   */
  getPointAt(ray, t) {
    const point = vec3.scale(vec3.create(), ray.direction, t);
    vec3.add(point, point, ray.origin);
    return point;
  }
}
