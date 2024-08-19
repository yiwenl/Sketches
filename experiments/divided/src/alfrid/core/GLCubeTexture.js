import { GL } from "./GL";
import {
  getTextureParameters,
  isSourceHtmlElement,
  webgl2TextureCheck,
  isPowerOfTwo,
} from "../utils/TextureUtils";
import { WebGLNumber } from "../utils/WebGLNumber";
import { WebGLConst } from "../utils/WebGLConst";
import LogError, { Errors } from "../utils/LogError";

class GLCubeTexture {
  constructor(mSource, mParam = {}, mWidth = 0, mHeight = 0) {
    this._source = mSource;
    this._isHtmlElement = isSourceHtmlElement(this._source[0]);
    this._getDimension(mSource, mWidth, mHeight);
    this._params = getTextureParameters(mParam, this._width, this._height);
    this._checkMipmap();
  }

  /**
   * Bind the texture
   *
   * @param {number} mIndex the binding target
   * @param {GL} mGL the GLTool instance
   */
  bind(mIndex, mGL) {
    this.createTexture(mGL);

    const { gl } = this.GL;
    gl.activeTexture(gl.TEXTURE0 + mIndex);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._texture);
  }

  /**
   * Unbind the texture
   *
   */
  unbind() {
    this.GL.gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  }

  /**
   * Create the texture
   *
   */
  createTexture(mGL) {
    if (mGL !== undefined && this.GL !== undefined && mGL !== this.GL) {
      LogError(Errors.CUBE_TEXTURE_CONTEXT, this.GL.id);
      return;
    }

    this.GL = mGL || GL;
    if (!this._texture) {
      webgl2TextureCheck(this.GL, this._params);
      this._uploadTexture();
    }
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

    const targets = [
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    ];

    let numLevels = 1;
    let index = 0;
    numLevels = this._source.length / 6;
    this.numLevels = numLevels;

    this._texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this._texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    let w = this._width;
    let h = this._height;

    for (let level = 0; level < numLevels; level++) {
      targets.forEach((target, i) => {
        index = i * numLevels + level;

        if (this._isHtmlElement && !this.GL.webgl2) {
          // cmft irradiance dds missing data
          if (this._source[index].length > 0) {
            gl.texImage2D(
              target,
              level,
              this._params.internalFormat,
              this._params.format,
              this._params.type,
              this._source[index]
            );
          }
        } else {
          if (this._source[index].length > 0) {
            gl.texImage2D(
              target,
              level,
              this._params.internalFormat,
              w,
              h,
              0,
              this._params.format,
              this._params.type,
              this._source[index]
            );
          }
        }
      });

      w = w >> 1;
      h = h >> 1;
    }

    if (this._generateMipmap) {
      gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    }

    // texture parameters
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_MAG_FILTER,
      this._params.magFilter
    );
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_MIN_FILTER,
      this._params.minFilter
    );
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_WRAP_S,
      this._params.wrapS
    );
    gl.texParameteri(
      gl.TEXTURE_CUBE_MAP,
      gl.TEXTURE_WRAP_T,
      this._params.wrapT
    );
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, this._premultiplyAlpha);

    // unbind the texture
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
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

  /**
   * Getting the dimension of the source
   *
   */
  _getDimension(mSource, mWidth, mHeight) {
    if (mSource) {
      // for html image / video element
      this._width = mSource[0].width || mSource[0].videoWidth;
      this._height = mSource[0].height || mSource[0].videoWidth;

      // for manual width / height settings
      this._width = this._width || mWidth;
      this._height = this._height || mHeight;

      // auto detect ( data array) ? not sure is good idea ?
      // todo : check HDR
      if (!this._width || !this._height) {
        this._width = this._height = Math.sqrt(mSource[0].length / 4);
        // console.log('Auto detect, data dimension : ', this._width, this._height);
      }
    } else {
      this._width = mWidth;
      this._height = mHeight;
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

export { GLCubeTexture };
