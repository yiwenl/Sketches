import { GL, GLShader } from "alfrid";

const fsEmpty = `#version 300 es
void main(void) {   
}`;

const getVaryingName = (mName) => {
  return `o${mName.substring(0, 1).toUpperCase()}${mName.substring(1)}`;
};

const sizeOfFloat = 4;

export default class TransformFeedback {
  constructor(mData, mShader) {
    this._initData = mData;
    this._numItems = this._initData.length;

    this._fields = Object.keys(this._initData[0]);
    this._createBuffer();

    // create shader
    const varyings = this._fields.map(getVaryingName);

    const { gl } = GL;
    this._shader = new GLShader(mShader, fsEmpty);
    this._shader.bind();
    const { shaderProgram: program } = this._shader;

    gl.transformFeedbackVaryings(program, varyings, gl.INTERLEAVED_ATTRIBS);
    gl.linkProgram(program);
  }

  _createBuffer() {
    const { gl } = GL;

    // create field map
    const fieldMap = [];
    const length = 4; // force each field to be vec4 to avoid hardware bug
    let numbersCount = 0;
    this._fields.forEach((f) => {
      numbersCount += length;
      fieldMap.push({ name: f, length });
    });
    const stride = numbersCount * 4;

    // create buffer
    const numFields = this._fields.length * 4;
    const initialData = new Float32Array(this._initData.length * numFields);
    this._initData.forEach((p, i) => {
      const s = i * numFields;
      fieldMap.forEach(({ name }, j) => {
        const d = p[name];
        initialData.set(d, s + j * 4);
      });
    });

    // create buffers and vaos
    this._buffer1 = gl.createBuffer();
    this._buffer2 = gl.createBuffer();
    this._vao1 = gl.createVertexArray();
    this._vao2 = gl.createVertexArray();

    const setupVao = (vao, buffer, data) => {
      let k = 0;
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_READ);
      fieldMap.forEach(({ length }, i) => {
        gl.vertexAttribPointer(i, length, gl.FLOAT, false, stride, k);
        gl.enableVertexAttribArray(i);
        k += length * sizeOfFloat;
      });
    };

    setupVao(this._vao1, this._buffer1, initialData);
    setupVao(this._vao2, this._buffer2, initialData.byteLength);

    this._buffers = [this._buffer1, this._buffer2];
    this._vaos = [this._vao1, this._vao2];

    // // unbind buffer
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }

  uniform(mName, mValue) {
    this._shader.uniform(mName, mValue);
    return this;
  }

  draw() {
    const { gl } = GL;
    this._shader.bind();
    this._shader.updateUniforms();

    GL.enable(GL.RASTERIZER_DISCARD);

    gl.bindVertexArray(this.vao);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, this.write);
    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, this._numItems);
    gl.endTransformFeedback();

    // unbind buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);

    GL.disable(GL.RASTERIZER_DISCARD);

    this.swap();
  }

  swap() {
    this._vaos = this._vaos.reverse();
    this._buffers = this._buffers.reverse();
  }

  get read() {
    return this._buffers[0];
  }

  get write() {
    return this._buffers[1];
  }

  get vao() {
    return this._vaos[0];
  }
}
