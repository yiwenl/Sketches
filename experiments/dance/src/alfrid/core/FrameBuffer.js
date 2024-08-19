import { GL } from "./GL";
import { GLTexture } from "./GLTexture";
import { WebGLNumber } from "../utils/WebGLNumber";
import { WebGLConst } from "../utils/WebGLConst";
import LogError, { Errors } from "../utils/LogError";

function FrameBuffer(mWidth, mHeight, mParameters = {}, mNumTargets = 1) {
  let _GL;
  let _frameBuffer;
  const _width = mWidth;
  const _height = mHeight;
  const _parameters = mParameters;
  const _numTargets = mNumTargets;
  const _textures = [];
  let _depthTexture;

  /**
   * Bind the frame buffer
   *
   * @param {GL} mGL the GLTool instance
   * @param {boolean} mAutoSetViewport automatically set the viewport to framebuffer's viewport
   */
  this.bind = function(mGL, mAutoSetViewport = true) {
    if (mGL !== undefined && _GL !== undefined && mGL !== _GL) {
      LogError(Errors.FRAMEBUFFER_CONTEXT, _GL.id);
      return;
    }

    _GL = mGL || GL;
    const { gl } = _GL;

    if (_numTargets > 1 && !_GL.multiRenderTargetSupport) {
      LogError(Errors.DRAW_BUFFERS, _GL.id);
    }

    if (!_frameBuffer) {
      _initFrameBuffer();
    }

    if (mAutoSetViewport) {
      _GL.viewport(0, 0, _width, _height);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, _frameBuffer);
  };

  /**
   * Unbind the frame buffer
   *
   * @param {boolean} mAutoSetViewport automatically set the viewport back to GL's viewport
   */
  this.unbind = function(mAutoSetViewport = true) {
    if (mAutoSetViewport) {
      _GL.viewport(0, 0, _GL.width, _GL.height);
    }
    const { gl } = _GL;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    _textures.forEach((texture) => {
      texture.generateMipmap();
    });
  };

  /**
   * Get the texture
   *
   * @param {number} mIndex the index of the texture
   */
  this.getTexture = function(mIndex = 0) {
    return _textures[mIndex];
  };

  /**
   * Destroy the framebuffer
   *
   */
  this.destroy = function() {
    const { gl } = _GL;

    // delete all textures
    _textures.forEach((t) => t.destroy());

    // delete depth texture
    _depthTexture.destroy();

    // delete framebuffer
    gl.deleteFramebuffer(_frameBuffer);

    _GL.frameBufferCount--;
  };

  /**
   * Initialize the framebuffer
   *
   */
  const _initFrameBuffer = () => {
    // create textures
    _initTextures();

    const { gl } = _GL;
    _frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, _frameBuffer);
    _GL.frameBufferCount++;

    const target = _GL.webgl2 ? gl.DRAW_FRAMEBUFFER : gl.FRAMEBUFFER;

    const buffers = [];
    for (let i = 0; i < _numTargets; i++) {
      gl.framebufferTexture2D(
        target,
        gl.COLOR_ATTACHMENT0 + i,
        gl.TEXTURE_2D,
        _textures[i].texture,
        0
      );
      buffers.push(WebGLConst[`COLOR_ATTACHMENT${i}`]);
    }

    // multi render targets
    if (_GL.multiRenderTargetSupport) {
      gl.drawBuffers(buffers);
    }

    // depth texture
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      _depthTexture.texture,
      0
    );

    // UNBIND
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  /**
   * Initialize the textures
   *
   */
  const _initTextures = () => {
    for (let i = 0; i < _numTargets; i++) {
      _textures.push(_createTexture());
    }

    const { gl } = _GL;

    const internalFormat = _GL.webgl2
      ? gl.DEPTH_COMPONENT16
      : gl.DEPTH_COMPONENT;

    // depth texture
    _depthTexture = _createTexture(
      internalFormat,
      WebGLConst.UNSIGNED_INT,
      WebGLConst.DEPTH_COMPONENT,
      {
        minFilter: WebGLConst.NEAREST,
        magFilter: WebGLConst.NEAREST,
        mipmap: false,
      }
    );
  };

  /**
   * Create texture
   *
   * @param {GLenum} mInternalformat GLenum value of the internal format
   * @param {GLenum} mTexelType GLenum value of texel type
   * @param {GLenum} mFormat GLenum value of the format
   * @param {object} mParameters the texture parameters
   */
  const _createTexture = (
    mInternalformat,
    mTexelType,
    mFormat,
    mParameters = {}
  ) => {
    const parameters = Object.assign({}, _parameters);

    if (!mFormat) {
      mFormat = mInternalformat;
    }

    parameters.internalFormat = mInternalformat || WebGLConst.RGBA;
    parameters.format = mFormat || WebGLConst.RGBA;
    parameters.type = mTexelType || parameters.type;
    // if (
    //   mTexelType === WebGLConst.UNSIGNED_SHORT ||
    //   mTexelType === WebGLConst.UNSIGNED_INT
    // ) {
    //   // fix for depth textures
    //   parameters.type = mTexelType;
    // }
    Object.assign(parameters, mParameters);

    const texture = new GLTexture(null, parameters, _width, _height);

    // force to create glTexture
    texture.createTexture(_GL);
    return texture;
  };

  // getter & setters

  /**
   * Get the first texture
   *
   * @returns {GLTexture} the texture
   */
  this.__defineGetter__("texture", function() {
    return _textures[0];
  });

  /**
   * Get the depth texture
   *
   * @returns {GLTexture} the depth texture
   */
  this.__defineGetter__("depthTexture", function() {
    return _depthTexture;
  });

  /**
   * Get the width
   *
   * @returns {number} the width
   */
  this.__defineGetter__("width", function() {
    return _width;
  });

  /**
   * Get the height
   *
   * @returns {number} the height
   */
  this.__defineGetter__("height", function() {
    return _height;
  });
}
export { FrameBuffer };
