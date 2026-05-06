import { mat4, vec3 } from 'gl-matrix';

export class Camera {
  constructor(fov = 45, aspect = 1, near = 0.1, far = 1000) {
    this.mode = 'perspective';
    
    // Perspective params
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;

    // Orthographic params
    this.ortho = { left: -1, right: 1, bottom: -1, top: 1, near: 0.1, far: 1000 };

    this.projectionMatrix = mat4.create();
    this.viewMatrix = mat4.create();
    this.viewProjectionMatrix = mat4.create();

    this.position = vec3.fromValues(0, 0, 0);
    this.target = vec3.fromValues(0, 0, -1);
    this.up = vec3.fromValues(0, 1, 0);

    this.updateProjection();
    this.updateView();
  }

  setPerspective(fov, aspect, near, far) {
    this.mode = 'perspective';
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.updateProjection();
  }

  setOrthographic(left, right, bottom, top, near, far) {
    this.mode = 'orthographic';
    this.ortho.left = left;
    this.ortho.right = right;
    this.ortho.bottom = bottom;
    this.ortho.top = top;
    this.ortho.near = near;
    this.ortho.far = far;
    this.updateProjection();
  }

  updateProjection() {
    if (this.mode === 'perspective') {
      mat4.perspective(
        this.projectionMatrix,
        (this.fov * Math.PI) / 180,
        this.aspect,
        this.near,
        this.far
      );
    } else {
      mat4.ortho(
        this.projectionMatrix,
        this.ortho.left,
        this.ortho.right,
        this.ortho.bottom,
        this.ortho.top,
        this.ortho.near,
        this.ortho.far
      );
    }

    // WebGPU depth range is [0, 1], but gl-matrix (standard) is [-1, 1].
    // Remap Z from [-1, 1] to [0, 1]: z_new = 0.5 * z_old + 0.5
    const out = this.projectionMatrix;
    out[2] = out[2] * 0.5 + out[3] * 0.5;
    out[6] = out[6] * 0.5 + out[7] * 0.5;
    out[10] = out[10] * 0.5 + out[11] * 0.5;
    out[14] = out[14] * 0.5 + out[15] * 0.5;

    this.updateViewProjection();
  }

  updateView() {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
    this.updateViewProjection();
  }

  updateViewProjection() {
    mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
  }

  setPosition(x, y, z) {
    vec3.set(this.position, x, y, z);
    this.updateView();
  }

  setTarget(x, y, z) {
    vec3.set(this.target, x, y, z);
    this.updateView();
  }

  setUp(x, y, z) {
    vec3.set(this.up, x, y, z);
    this.updateView();
  }

  setAspect(aspect) {
    this.aspect = aspect;
    // Only meaningful for perspective in this simple impl, 
    // or we could adjust ortho width/height ratio if we wanted to maintain bounds.
    // For now keep as is.
    this.updateProjection();
  }
}
