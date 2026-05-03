import { mat4, vec3 } from "gl-matrix";

class PerspectiveCamera {
  constructor(fov, aspect, near, far) {
    this.projectionMatrix = mat4.create();
    this.viewMatrix = mat4.create();

    this.position = vec3.fromValues(0, 0, 5);
    this.target = vec3.fromValues(0, 0, 0);
    this.up = vec3.fromValues(0, 1, 0);

    this.fov = fov || (45 * Math.PI) / 180;
    this.aspect = aspect || 1;
    this.near = near || 0.1;
    this.far = far || 100;

    this.update();
  }

  setPerspective(fov, aspect, near, far) {
    if (fov !== undefined) this.fov = fov;
    if (aspect !== undefined) this.aspect = aspect;
    if (near !== undefined) this.near = near;
    if (far !== undefined) this.far = far;
    this.updateProjectionMatrix();
  }

  lookAt(target) {
    vec3.copy(this.target, target);
    this.updateViewMatrix();
  }

  setPosition(pos) {
    vec3.copy(this.position, pos);
    this.updateViewMatrix();
  }

  updateProjectionMatrix() {
    mat4.perspective(
      this.projectionMatrix,
      this.fov,
      this.aspect,
      this.near,
      this.far,
    );
  }

  updateViewMatrix() {
    mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);
  }

  update() {
    this.updateProjectionMatrix();
    this.updateViewMatrix();
  }
}

export default PerspectiveCamera;
