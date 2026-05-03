import { vec3 } from "gl-matrix";

class OrbitalControl {
  constructor(camera, canvas, radius = 5) {
    this.camera = camera;
    this.canvas = canvas;

    this.target = vec3.fromValues(0, 0, 0);

    // Current coordinates
    this.radius = radius;
    this.rx = 0; // longitude (theta)
    this.ry = Math.PI / 4; // latitude (phi)

    // Target coordinates for easing
    this.targetRadius = radius;
    this.targetRx = this.rx;
    this.targetRy = this.ry;

    // Control settings
    this.easing = 0.1;
    this.zoomSensitivity = 0.01;
    this.rotateSensitivity = 0.01;
    this.minRadius = 0.1;
    this.maxRadius = 1000;
    this.minRy = 0.01;
    this.maxRy = Math.PI - 0.01; // Avoid exact poles

    // State
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this._bindEvents();
    this.update();
  }

  _bindEvents() {
    this.canvas.addEventListener("mousedown", this._onDown.bind(this));
    this.canvas.addEventListener("touchstart", this._onDown.bind(this), {
      passive: false,
    });

    window.addEventListener("mousemove", this._onMove.bind(this));
    window.addEventListener("touchmove", this._onMove.bind(this), {
      passive: false,
    });

    window.addEventListener("mouseup", this._onUp.bind(this));
    window.addEventListener("touchend", this._onUp.bind(this));

    this.canvas.addEventListener("wheel", this._onWheel.bind(this), {
      passive: false,
    });
  }

  _getEventLocation(e) {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
  }

  _onDown(e) {
    this.isDragging = true;
    const { x, y } = this._getEventLocation(e);
    this.lastMouseX = x;
    this.lastMouseY = y;
  }

  _onMove(e) {
    if (!this.isDragging) return;

    const { x, y } = this._getEventLocation(e);
    const dx = x - this.lastMouseX;
    const dy = y - this.lastMouseY;

    this.targetRx -= dx * this.rotateSensitivity;
    this.targetRy -= dy * this.rotateSensitivity;

    // Clamp latitude
    this.targetRy = Math.max(this.minRy, Math.min(this.maxRy, this.targetRy));

    this.lastMouseX = x;
    this.lastMouseY = y;
  }

  _onUp() {
    this.isDragging = false;
  }

  _onWheel(e) {
    e.preventDefault();
    this.targetRadius += e.deltaY * this.zoomSensitivity;
    this.targetRadius = Math.max(
      this.minRadius,
      Math.min(this.maxRadius, this.targetRadius),
    );
  }

  update() {
    // Apply easing
    this.radius += (this.targetRadius - this.radius) * this.easing;
    this.rx += (this.targetRx - this.rx) * this.easing;
    this.ry += (this.targetRy - this.ry) * this.easing;

    // Calculate cartesian coordinates from spherical
    // Given WebGL/WebGPU convention: Y is up, -Z is forward
    const x = this.radius * Math.sin(this.ry) * Math.sin(this.rx);
    const y = this.radius * Math.cos(this.ry);
    const z = this.radius * Math.sin(this.ry) * Math.cos(this.rx);

    const pos = vec3.fromValues(
      this.target[0] + x,
      this.target[1] + y,
      this.target[2] + z,
    );

    this.camera.setPosition(pos);
    this.camera.lookAt(this.target);
    this.camera.update();
  }
}

export default OrbitalControl;
