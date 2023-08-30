import { GL } from "./GL";
import {
  isPowerOfTwo,
  getTextureParameters,
  isSourceHtmlElement,
  checkSource,
  webgl2TextureCheck,
  // webgl2FilterCheck,
} from "../utils/TextureUtils";
import { WebGLNumber } from "../utils/WebGLNumber";
import { BitSwitch } from "../utils/BitSwitch";
import LogError, { Errors } from "../utils/LogError";

const MIN_FILTER = 0;
const MAG_FILTER = 1;
const WRAP_S = 2;
const WRAP_T = 3;

class GLTexture {
  constructor(mSource, mParam = {}, mWidth = 0, mHeight = 0) {
    this._source = mSource;
    this._isHtmlElement = isSourceHtmlElement(this._source);
    if (!this._isHtmlElement && mSource) {
      if (!checkSource(mSource, mParam)) {
        return;
      }
    }

    this._getDimension(mSource, mWidth, mHeight);
    this._params = getTextureParameters(mParam, this._width, this._height);
    this._checkMipmap();

    // states
    this._parametersState = new BitSwitch(0);
  }

  /**
   * Bind the texture
   *
   * @param {number} mIndex the binding target
   * @param {GL} mGL the GLTool instance
   */
  bind(mIndex, mGL) {
    if (mGL !== undefined && this.GL !== undefined && mGL !== this.GL) {
      LogError(Errors.TEXTURE_CONTEXT, this.GL.id);
      return;
    }

    this.GL = mGL || GL;
    const { gl } = this.GL;

    this.createTexture(this.GL);

    gl.activeTexture(gl.TEXTURE0 + mIndex);
    gl.bindTexture(gl.TEXTURE_2D, this._texture);

    this._checkParameters();
  }

  /**
   * Create the texture
   *
   */
  createTexture(mGL) {
    if (mGL !== undefined && this.GL !== undefined && mGL !== this.GL) {
      LogError(Errors.TEXTURE_CONTEXT, this.GL.id);
      return;
    }

    this.GL = mGL || GL;
    if (!this._texture) {
      webgl2TextureCheck(this.GL, this._params);
      this._uploadTexture();
    }
  }

  /**
   * Update the texture
   *
   * @param {object} mSource the texture source
   */
  updateTexture(mSource) {
    this._source = mSource;
    this._uploadTexture();
  }

  /**
   * Generate the mipmap of the texture
   *
   */
  generateMipmap() {
    if (!this._generateMipmap) {
      return;
    }
    const { gl } = this.GL;
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  /**
   * Destroy the texture
   *
   */
  destroy() {
    const { gl } = this.GL;
    gl.deleteTexture(this._texture);
    this.GL.textureCount--;
  }

  /**
   * Display the properties of the texture
   *
   */
  showProperties() {
    console.log("Dimension :", this._width, this._height);
    for (const s in this._params) {
      console.log(s, WebGLNumber[this._params[s]] || this._params[s]);
    }
  }

  /**
   * Upload and create the texture
   *
   */
  _uploadTexture() {
    const { gl } = this.GL;

    if (!this._texture) {
      this._texture = gl.createTexture();
      this.GL.textureCount++;
    }
    gl.bindTexture(gl.TEXTURE_2D, this._texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    if (this._isHtmlElement && !this.GL.webgl2) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        this._params.internalFormat,
        this._params.format,
        this._params.type,
        this._source
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        this._params.internalFormat,
        this._width,
        this._height,
        0,
        this._params.format,
        this._params.type,
        this._source
      );
    }

    // texture parameters
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MAG_FILTER,
      this._params.magFilter
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      this._params.minFilter
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._params.wrapS);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._params.wrapT);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this._premultiplyAlpha);

    // const ext = this.GL.extensions["EXT_texture_filter_anisotropic"];
    // if (ext) {
    //   const level = this._params.anisotropy || this.GL.maxAnisotropy;
    //   gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, level);
    // }

    if (this._generateMipmap) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    // gl.bindTexture(gl.TEXTURE_2D, null);
  }

  /**
   * Check if the paramets has changed
   *
   */
  _checkParameters() {
    const { gl } = this.GL;
    if (this._parametersState.value > 0) {
      if (this._parametersState.get(MIN_FILTER)) {
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MIN_FILTER,
          this._params.minFilter
        );
      } else if (this._parametersState.get(MAG_FILTER)) {
        gl.texParameteri(
          gl.TEXTURE_2D,
          gl.TEXTURE_MAG_FILTER,
          this._params.magFilter
        );
      } else if (this._parametersState.get(WRAP_S)) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, this._params.wrapS);
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, this._params.wrapT);
      }
    }
    this._parametersState.reset(0);
  }

  /**
   * Getting the dimension of the source
   *
   */
  _getDimension(mSource, mWidth, mHeight) {
    if (mSource) {
      // for html image / video element
      this._width = mSource.width || mSource.videoWidth;
      this._height = mSource.height || mSource.videoWidth;

      // for manual width / height settings
      this._width = this._width || mWidth;
      this._height = this._height || mHeight;

      // auto detect ( data array) ? not sure is good idea ?
      // todo : check HDR
      if (!this._width || !this._height) {
        this._width = this._height = Math.sqrt(mSource.length / 4);
        // console.log('Auto detect, data dimension : ', this._width, this._height);
      }
    } else {
      this._width = mWidth;
      this._height = mHeight;
    }
  }

  /**
   * Check if the texture could have mipmap
   *
   */
  _checkMipmap() {
    this._generateMipmap = this._params.mipmap;

    if (!(isPowerOfTwo(this._width) && isPowerOfTwo(this._height))) {
      this._generateMipmap = false;
    }

    const minFilter = WebGLNumber[this._params.minFilter];
    if (minFilter.indexOf("MIPMAP") === -1) {
      this._generateMipmap = false;
    }
  }

  // getter & setters

  /**
   * Get the glTexture
   *
   * @returns {glTexture} the webgl texture
   */
  get texture() {
    return this._texture;
  }

  /**
   * Set the min filter of the texture
   *
   * @param {GLenum} mValue GLenum value of the min filter
   */
  set minFilter(mValue) {
    this._params.minFilter = mValue;
    this._parametersState.set(MIN_FILTER, 1);
    // webgl2FilterCheck(this._params);
  }

  /**
   * Get the min filter of the texture
   *
   * @returns {GLenum} the min filter value
   */
  get minFilter() {
    return this._params.minFilter;
  }

  /**
   * Set the mag filter of the texture
   *
   * @param {GLenum} mValue GLenum value of the mag filter
   */
  set magFilter(mValue) {
    this._params.magFilter = mValue;
    this._parametersState.set(MAG_FILTER, 1);
    // webgl2FilterCheck(this._params);
  }

  /**
   * Get the mag filter of the texture
   *
   * @returns {GLenum} the mag filter value
   */
  get magFilter() {
    return this._params.magFilter;
  }

  /**
   * Set the s-coordinate of the wrapping
   *
   * @param {GLenum} mValue GLenum value of the wrapping
   */
  set wrapS(mValue) {
    this._params.wrapS = mValue;
    this._parametersState.set(WRAP_S, 1);
  }

  /**
   * Get the s-coordinate of the wrapping
   *
   * @returns {GLenum} the value of s-coordinate of the wrapping
   */
  get wrapS() {
    return this._params.wrapS;
  }

  /**
   * Set the t-coordinate of the wrapping
   *
   * @param {GLenum} mValue GLenum value of the wrapping
   */
  set wrapT(mValue) {
    this._params.wrapT = mValue;
    this._parametersState.set(WRAP_T, 1);
  }

  /**
   * Get the t-coordinate of the wrapping
   *
   * @returns {GLenum} the value of t-coordinate of the wrapping
   */
  get wrapT() {
    return this._params.wrapT;
  }

  /**
   * Get the width of the texture
   *
   * @returns {number} the width of the texture
   */
  get width() {
    return this._width;
  }

  /**
   * Get the height of the texture
   *
   * @returns {number} the height of the texture
   */
  get height() {
    return this._height;
  }
}

export { GLTexture };

export const getColorTexture = (mColor) => {
  const _colors = mColor.map((v) => Math.floor(v * 255));
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 4;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = `rgba(${_colors[0]}, ${_colors[1]}, ${_colors[2]}, 1)`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return new GLTexture(canvas);
};
