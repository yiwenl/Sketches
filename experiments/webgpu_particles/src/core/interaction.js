import { Ray, Plane } from '../utils/math_3d.js';
import { Constants } from '../constants.js';
import { vec3 } from 'gl-matrix';

export class InteractionManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = { x: 0, y: 0 };
    this.hitPoint = null;
    this.prevHitPoint = null;
    this.velocity = vec3.create();
    this.floorPlane = new Plane([0, 1, 0], Constants.floorY);

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('touchstart', this.onTouchMove, { passive: false });
    window.addEventListener('touchmove', this.onTouchMove, { passive: false });
  }

  onMouseMove(event) {
    this.updateMouse(event.clientX, event.clientY);
  }

  onTouchMove(event) {
    if (event.touches.length > 0) {
      this.updateMouse(event.touches[0].clientX, event.touches[0].clientY);
    }
  }

  updateMouse(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = clientX - rect.left;
    this.mouse.y = clientY - rect.top;
  }

  update(camera) {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    // NDC coordinates
    const ndcX = (2.0 * this.mouse.x) / width - 1.0;
    const ndcY = 1.0 - (2.0 * this.mouse.y) / height;

    const ray = Ray.fromScreen(ndcX, ndcY, camera);
    const t = this.floorPlane.intersectRay(ray);

    this.prevHitPoint = this.hitPoint ? vec3.clone(this.hitPoint) : null;

    if (t !== null) {
      this.hitPoint = this.floorPlane.getPointAt(ray, t);
      
      if (this.prevHitPoint) {
        vec3.subtract(this.velocity, this.hitPoint, this.prevHitPoint);
      } else {
        vec3.set(this.velocity, 0, 0, 0);
      }
    } else {
      this.hitPoint = null;
      vec3.set(this.velocity, 0, 0, 0);
    }
  }

  destroy() {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchstart', this.onTouchMove);
    window.removeEventListener('touchmove', this.onTouchMove);
  }
}
