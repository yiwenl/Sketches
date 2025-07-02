import { GL } from "alfrid";

export default class UniformBufferObject {
  constructor(blockName, block, bindingPoint) {
    this.blockName = blockName;
    this.dataMap = new Map();
    this._changedData = [];

    if (block instanceof WebGLBuffer) {
      this.buffer = block;
    } else {
      if (typeof block !== "number") {
        this._data = block;
        this.blockSize = block.byteLength;
        this._changedData.push({ offset: 0, data: block });
      } else {
        this.blockSize = block; // Total size of the uniform block in bytes
      }
    }

    this.bindingPoint = bindingPoint; // Binding point index for this UBO
  }

  createBufferObject() {
    const { gl } = this.GL;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);
    gl.bufferData(gl.UNIFORM_BUFFER, this.blockSize, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);

    // Bind the buffer to the binding point
    gl.bindBufferBase(gl.UNIFORM_BUFFER, this.bindingPoint, this.buffer);
  }

  linkToShader(program) {
    const { gl } = this.GL;
    // Retrieve the index of the uniform block in the shader
    const blockIndex = gl.getUniformBlockIndex(program, this.blockName);
    if (blockIndex === -1) {
      console.warn(`Uniform block "${this.blockName}" not found in program.`);
      return;
    }
    // Link the uniform block index to the binding point
    gl.uniformBlockBinding(program, blockIndex, this.bindingPoint);
  }

  updateData(offset, data) {
    this._changedData.push({ offset, data });
    this.dataMap.set(offset, data);
  }

  // pointing to a buffer object
  setBuffer(buffer) {
    this.buffer = buffer;
  }

  bind(mGL) {
    this.GL = mGL || GL;
    if (!this.buffer) {
      this.createBufferObject();
    }

    // no shader program to link to
    if (!this.GL.shaderProgram) return;
    const { gl } = this.GL;

    // update buffer data
    if (this._changedData.length > 0) {
      gl.bindBuffer(gl.UNIFORM_BUFFER, this.buffer);

      while (this._changedData.length) {
        const { offset, data } = this._changedData.pop();
        gl.bufferSubData(gl.UNIFORM_BUFFER, offset, data);
      }
      gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    }

    this.linkToShader(this.GL.shaderProgram);
    // Bind the buffer to make it active (if not already bound in bindBufferBase)
    gl.bindBufferBase(gl.UNIFORM_BUFFER, this.bindingPoint, this.buffer);
  }
}
