module.exports = `precision highp float;
precision mediump sampler2D;

varying vec2 vTextureCoord; // grid coordinates    
uniform vec2 uTexelSize;
uniform sampler2D texturePressure;
uniform sampler2D textureDivergence;

void main() {
  // left, right, bottom, and top texturePressure samples
  float L = texture2D(texturePressure, vTextureCoord - vec2(uTexelSize.x, 0.0)).x;
  float R = texture2D(texturePressure, vTextureCoord + vec2(uTexelSize.x, 0.0)).x;
  float B = texture2D(texturePressure, vTextureCoord - vec2(0.0, uTexelSize.y)).x;
  float T = texture2D(texturePressure, vTextureCoord + vec2(0.0, uTexelSize.y)).x;

  // textureDivergence sample, from center
  float bC = texture2D(textureDivergence, vTextureCoord).x;
  
  // evaluate Jacobi iteration
  gl_FragColor = vec4(0.25 * (L + R + B + T - bC), 0, 0, 1);
}`;
