const Errors = {
  DRAW_BUFFERS: `This browser doesn't support multi render targets : WEBGL_draw_buffers`,
  FRAMEBUFFER_CONTEXT: `This framebuffer has been bind to a different WebGL Rendering Context`,
  SHADER_CONTEXT: `This shader has been bind to a different WebGL Rendering Context`,
  TEXTURE_CONTEXT: `This texture has been bind to a different WebGL Rendering Context`,
  CUBE_TEXTURE_CONTEXT: `This cube texture has been bind to a different WebGL Rendering Context`,
};

const logError = (mMessage, mExtra = "") => {
  console.error(mMessage, mExtra);
};

export default logError;
export { Errors };
