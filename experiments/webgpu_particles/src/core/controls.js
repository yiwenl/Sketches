import { vec3, mat4 } from 'gl-matrix';
import EaseNumber from '../utils/ease-number.js';

export class OrbitControls {
  constructor(camera, element) {
    this.camera = camera;
    this.element = element;

    this.target = vec3.clone(camera.target);
    this.minDistance = 0.5;
    this.maxDistance = 100;
    this.zoomSpeed = 0.05;
    this.rotateSpeed = 0.01;

    // Spherical coordinates - initialize from camera position
    const offset = vec3.create();
    vec3.subtract(offset, camera.position, this.target);
    const initialRadius = vec3.length(offset);
    let initialTheta, initialPhi;

    if (initialRadius > 0) {
      initialTheta = Math.atan2(offset[0], offset[2]);
      initialPhi = Math.acos(Math.max(-1, Math.min(1, offset[1] / initialRadius)));
    } else {
      initialTheta = 0;
      initialPhi = Math.PI / 2;
    }

    const easing = 0.05;
    this._theta = new EaseNumber(initialTheta, easing);
    this._phi = new EaseNumber(initialPhi, easing);
    this._radius = new EaseNumber(initialRadius || 10, easing);

    // Clamp vertical angle to avoid flipping (0.01 to PI - 0.01)
    this._phi.limit(0.01, Math.PI - 0.01);

    // Mouse state
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    // Touch state
    this.lastTouchX = 0;
    this.lastTouchY = 0;
    this.lastPinchDistance = 0;

    // Bind events
    this.element.addEventListener('mousedown', this.onMouseDown.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.element.addEventListener('wheel', this.onWheel.bind(this), { passive: false });

    // Touch events
    this.element.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

    // Initial update
    this.update();
  }

  onTouchStart(event) {
    if (event.touches.length === 1) {
      this.isDragging = true;
      this.lastTouchX = event.touches[0].clientX;
      this.lastTouchY = event.touches[0].clientY;
    } else if (event.touches.length === 2) {
      this.isDragging = false; // Disable rotation when pinching
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      this.lastPinchDistance = Math.sqrt(dx * dx + dy * dy);
    }
    event.preventDefault();
  }

  onTouchMove(event) {
    if (event.touches.length === 1 && this.isDragging) {
      const deltaX = event.touches[0].clientX - this.lastTouchX;
      const deltaY = event.touches[0].clientY - this.lastTouchY;

      this.lastTouchX = event.touches[0].clientX;
      this.lastTouchY = event.touches[0].clientY;

      this._theta.value = this._theta.target - deltaX * this.rotateSpeed;
      this._phi.value = this._phi.target - deltaY * this.rotateSpeed;
    } else if (event.touches.length === 2) {
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      const delta = this.lastPinchDistance - distance;
      this.lastPinchDistance = distance;

      this._radius.value = Math.max(
        this.minDistance, 
        Math.min(this.maxDistance, this._radius.target + delta * this.zoomSpeed * 0.5)
      );
    }
    event.preventDefault();
  }

  onTouchEnd(event) {
    this.isDragging = false;
    this.lastPinchDistance = 0;
  }

  onMouseDown(event) {
    this.isDragging = true;
    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;
  }

  onMouseMove(event) {
    if (!this.isDragging) return;

    const deltaX = event.clientX - this.lastMouseX;
    const deltaY = event.clientY - this.lastMouseY;

    this.lastMouseX = event.clientX;
    this.lastMouseY = event.clientY;

    if (event.shiftKey) {
      this.pan(deltaX, deltaY);
    } else {
      // Update angles based on mouse movement
      this._theta.value = this._theta.target - deltaX * this.rotateSpeed;
      this._phi.value = this._phi.target - deltaY * this.rotateSpeed;      
    }

    // console.log(this._phi.value)
  }

  pan(deltaX, deltaY) {
    const v = this.camera.viewMatrix;
    const right = vec3.fromValues(v[0], v[4], v[8]);
    const up = vec3.fromValues(v[1], v[5], v[9]);

    // Pan speed relative to distance
    const panSpeed = this._radius.value * 0.001;

    vec3.scale(right, right, -deltaX * panSpeed);
    vec3.scale(up, up, deltaY * panSpeed);

    const move = vec3.create();
    vec3.add(move, right, up);
    vec3.add(this.target, this.target, move);
  }

  onMouseUp() {
    this.isDragging = false;
  }

  onWheel(event) {
    event.preventDefault();
    this._radius.value = Math.max(this.minDistance, Math.min(this.maxDistance, this._radius.target + event.deltaY * this.zoomSpeed));
  }

  update() {
    const theta = this._theta.value;
    const phi = this._phi.value;
    const r = this._radius.value;

    const x = this.target[0] + r * Math.sin(phi) * Math.sin(theta);
    const y = this.target[1] + r * Math.cos(phi);
    const z = this.target[2] + r * Math.sin(phi) * Math.cos(theta);

    this.camera.setPosition(x, y, z);
    this.camera.setTarget(this.target[0], this.target[1], this.target[2]);
  }
}
