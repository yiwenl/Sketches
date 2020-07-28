// index.js

export { saveImage } from './saveImage'
export { saveJson } from './saveJson'
export { resize } from './resizeCanavs'

export const biasMatrix = mat4.fromValues(
  0.5, 0.0, 0.0, 0.0,
  0.0, 0.5, 0.0, 0.0,
  0.0, 0.0, 0.5, 0.0,
  0.5, 0.5, 0.5, 1.0
)
