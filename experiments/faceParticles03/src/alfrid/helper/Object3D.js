import { vec3, mat4, quat } from "gl-matrix";
function Object3D() {
  let _position = vec3.create();
  let _rotation = vec3.create();
  let _scale = vec3.fromValues(1, 1, 1);

  let _matrix = mat4.create();
  let _matrixParent = mat4.create();
  let _matrixTranslation = mat4.create();
  let _matrixRotation = mat4.create();
  let _matrixScale = mat4.create();
  let _matrixQuaternion = mat4.create();
  let _quat = quat.create();

  let _children = [];
  let _needUpdate = true;

  /**
   * Force calling update the matrix
   *
   * @param {mat4} mParentMatrix the parent matrix
   */
  this.update = function(mParentMatrix) {
    if (mParentMatrix !== undefined) {
      mat4.copy(_matrixParent, mParentMatrix);
    }
    _needUpdate = true;
    _updateMatrix();
  };

  /**
   * Add child to the scene graph
   *
   * @param {Object3D} mChild the child
   */
  this.addChild = function(mChild) {
    _children.push(mChild);
  };

  /**
   * Remove child from the scene graph
   *
   * @param {Object3D} mChild the child
   */
  this.removeChild = function(mChild) {
    const index = _children.indexOf(mChild);
    if (index == -1) {
      console.warn("Child no exist");
      return;
    }

    _children.splice(index, 1);
  };

  /**
   * Set the rotation from quaternion
   *
   * @param {Object3D} mQuat the quaternion value
   */
  this.setRotationFromQuaternion = function(mQuat) {
    quat.copy(_quat, mQuat);
    _needUpdate = true;
  };

  /**
   * Update the matrix
   *
   */
  const _updateMatrix = () => {
    if (!_needUpdate) {
      return;
    }

    mat4.identity(_matrixTranslation, _matrixTranslation);
    mat4.identity(_matrixScale, _matrixScale);
    mat4.identity(_matrixRotation, _matrixRotation);

    mat4.rotateX(_matrixRotation, _matrixRotation, _rotation[0]);
    mat4.rotateY(_matrixRotation, _matrixRotation, _rotation[1]);
    mat4.rotateZ(_matrixRotation, _matrixRotation, _rotation[2]);

    mat4.fromQuat(_matrixQuaternion, _quat);
    mat4.mul(_matrixRotation, _matrixQuaternion, _matrixRotation);

    mat4.scale(_matrixScale, _matrixScale, _scale);
    mat4.translate(_matrixTranslation, _matrixTranslation, _position);

    mat4.mul(_matrix, _matrixTranslation, _matrixRotation);
    mat4.mul(_matrix, _matrix, _matrixScale);
    // mat4.mul(this._matrix, this._matrix, this._matrixParent);
    mat4.mul(_matrix, _matrixParent, _matrix);

    // update the children
    _children.forEach((child) => {
      child.update(_matrix);
    });

    _needUpdate = false;
  };

  // getters & setters
  /**
   * Get the matrix
   *
   * @returns {mat4} the matrix
   */
  this.__defineGetter__("matrix", function() {
    _updateMatrix();
    return _matrix;
  });

  /**
   * Set the x value of the object
   *
   * @param {number} mValue the value
   */
  this.__defineSetter__("x", function(mValue) {
    _position[0] = mValue;
    _needUpdate = true;
  });

  /**
   * Get the x value of the object
   *
   * @returns {number} the x value
   */
  this.__defineGetter__("x", function() {
    return _position[0];
  });

  /**
   * Set the y value of the object
   *
   * @param {number} mValue the value
   */
  this.__defineSetter__("y", function(mValue) {
    _position[1] = mValue;
    _needUpdate = true;
  });

  /**
   * Get the y value of the object
   *
   * @returns {number} the y value
   */
  this.__defineGetter__("y", function() {
    return _position[1];
  });

  /**
   * Set the z value of the object
   *
   * @param {number} mValue the value
   */
  this.__defineSetter__("z", function(mValue) {
    _position[2] = mValue;
    _needUpdate = true;
  });

  /**
   * Get the z value of the object
   *
   * @returns {number} the z value
   */
  this.__defineGetter__("z", function() {
    return _position[2];
  });

  /**
   * Set the scale x value of the object
   *
   * @param {number} mValue the value
   */
  this.__defineSetter__("scaleX", function(mValue) {
    _scale[0] = mValue;
    _needUpdate = true;
  });

  /**
   * Get the scale x value of the object
   *
   * @returns {number} the scale x value
   */
  this.__defineGetter__("scaleX", function() {
    return _scale[0];
  });

  /**
   * Set the scale y value of the object
   *
   * @param {number} mValue the value
   */
  this.__defineSetter__("scaleY", function(mValue) {
    _scale[1] = mValue;
    _needUpdate = true;
  });

  /**
   * Get the scale y value of the object
   *
   * @returns {number} the scale y value
   */
  this.__defineGetter__("scaleY", function() {
    return _scale[1];
  });

  /**
   * Set the scale z value of the object
   *
   * @param {number} mValue the value
   */
  this.__defineSetter__("scaleZ", function(mValue) {
    _scale[2] = mValue;
    _needUpdate = true;
  });

  /**
   * Get the scale z value of the object
   *
   * @returns {number} the scale z value
   */
  this.__defineGetter__("scaleZ", function() {
    return _scale[2];
  });

  /**
   * Set the rotation x value of the object
   *
   * @param {number} mValue the value
   */
  this.__defineSetter__("rotationX", function(mValue) {
    _rotation[0] = mValue;
    _needUpdate = true;
  });

  /**
   * Get the rotation x value of the object
   *
   * @returns {number} the rotation x value
   */
  this.__defineGetter__("rotationX", function() {
    return _rotation[0];
  });

  /**
   * Set the rotation y value of the object
   *
   * @param {number} mValue the value
   */
  this.__defineSetter__("rotationY", function(mValue) {
    _rotation[1] = mValue;
    _needUpdate = true;
  });

  /**
   * Get the rotation y value of the object
   *
   * @returns {number} the rotation y value
   */
  this.__defineGetter__("rotationY", function() {
    return _rotation[1];
  });

  /**
   * Set the rotation z value of the object
   *
   * @param {number} mValue the value
   */
  this.__defineSetter__("rotationZ", function(mValue) {
    _rotation[2] = mValue;
    _needUpdate = true;
  });

  /**
   * Get the rotation z value of the object
   *
   * @returns {number} the rotation z value
   */
  this.__defineGetter__("rotationZ", function() {
    return _rotation[2];
  });

  /**
   * Get the children of the object
   *
   */
  this.__defineGetter__("children", function() {
    return _children;
  });
}

export { Object3D };
