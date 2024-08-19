import { GL } from "./GL";
import {
  addLineNumbers,
  uniformMapping,
  getUniformType,
  cloneValue,
} from "../utils/ShaderUtils";
import { equals } from "../utils/";
import vsDefault from "../shader/glsl/basic.vert";
import fsDefault from "../shader/glsl/basic.frag";

function GLShader(mVertexShader, mFragmentShader) {
  this.vertexShader = mVertexShader || vsDefault;
  this.fragmentShader = mFragmentShader || fsDefault;
  this.shaderProgram;

  let _GL;
  let _uniformCache = {};

  /**
   * Bind the current shader
   *
   * @param {GL} mGL the GLTool instance
   */
  this.bind = function (mGL) {
    if (mGL !== undefined && _GL !== undefined && mGL !== _GL) {
      console.error(
        "this shader has been bind to a different WebGL Rendering Context",
        _GL.id
      );
      return;
    }

    _GL = mGL || GL;
    if (!this.shaderProgram) {
      const vsShader = createShaderProgram(this.vertexShader, true);
      const fsShader = createShaderProgram(this.fragmentShader, false);
      attachShaderProgram(vsShader, fsShader);
    }

    _GL.useShader(this);
  };

  /**
   * Set the uniform of the shader
   *
   * @param {string|object} mName the name of the uniform
   * @param {string} mType the type of the uniform
   * @param {number|[numbers]} mValue the value of the uniform
   */
  this.uniform = function (mName, mType, mValue) {
    let value;
    let type;
    if (mValue === undefined) {
      type = getUniformType(mType);
      value = mType;
    } else {
      type = mType;
      value = mValue;
    }
    const uniformType = uniformMapping[type];

    if (!_uniformCache[mName]) {
      _uniformCache[mName] = {
        type,
        uniformType,
        value: cloneValue(value),
        changed: true,
      };
    } else {
      const oUniform = _uniformCache[mName];
      if (!equals(oUniform.value, value)) {
        oUniform.value = cloneValue(value);
        oUniform.changed = true;
      }
    }
    return this;
  };

  /**
   * Destroy the current shader
   *
   */
  this.updateUniforms = function () {
    if (!_GL) {
      console.warn(
        "No WebGL Context has been set yet, please call shader.bind() first"
      );
      return;
    }
    const { gl } = _GL;

    for (let s in _uniformCache) {
      const oUniform = _uniformCache[s];
      if (oUniform.changed) {
        const name = s;

        if (!oUniform.uniformLoc) {
          oUniform.uniformLoc = gl.getUniformLocation(this.shaderProgram, name);
        }
        const { uniformLoc, uniformType, value } = oUniform;
        if (uniformLoc !== null) {
          if (uniformType.indexOf("Matrix") === -1) {
            gl[uniformType](uniformLoc, value);
          } else {
            gl[uniformType](uniformLoc, false, value);
          }
        }

        oUniform.changed = false;
      }
    }
  };

  /**
   * Destroy the current shader
   *
   */
  this.destroy = function () {
    const { gl } = _GL;
    gl.deleteProgram(this.shaderProgram);
    _GL.shaderCount--;
  };

  /**
   * Create & Compile shader
   *
   * @param {string} mShaderStr the shader program text
   * @param {boolean} isVertexShader is vertex shader or not
   */
  const createShaderProgram = (mShaderStr, isVertexShader) => {
    const { gl } = _GL;
    const shaderType = isVertexShader ? _GL.VERTEX_SHADER : _GL.FRAGMENT_SHADER;
    const shader = gl.createShader(shaderType);

    gl.shaderSource(shader, mShaderStr);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn("Error in Shader : ", gl.getShaderInfoLog(shader));
      console.log(addLineNumbers(mShaderStr));
      return null;
    }

    return shader;
  };

  /**
   * Attach shader
   *
   * @param {glShader} mVertexShader the vertex shader
   * @param {glShader} mFragmentShader the fragment shader
   */
  const attachShaderProgram = (mVertexShader, mFragmentShader) => {
    const { gl } = _GL;

    this.shaderProgram = gl.createProgram();
    gl.attachShader(this.shaderProgram, mVertexShader);
    gl.attachShader(this.shaderProgram, mFragmentShader);
    gl.deleteShader(mVertexShader);
    gl.deleteShader(mFragmentShader);

    gl.linkProgram(this.shaderProgram);
    _GL.shaderCount++;
  };
}

export { GLShader };
