module.exports = `
precision highp float;
precision mediump sampler2D;

varying vec2 vTextureCoord;        // grid coordinates
uniform vec2 uTexelSize;
uniform sampler2D textureVel; // vector field

vec2 sampleVelocity(in vec2 uv) {
    vec2 mult = vec2(1.0, 1.0);
    if (uv.x < 0.0 || uv.x > 1.0) { mult.x = -1.0; }
    if (uv.y < 0.0 || uv.y > 1.0) { mult.y = -1.0; }
    return texture2D(textureVel, uv).xy;
}

void main() {
  float L = sampleVelocity(vTextureCoord - vec2(uTexelSize.x, 0.0)).x;
  float R = sampleVelocity(vTextureCoord + vec2(uTexelSize.x, 0.0)).x;
  float T = sampleVelocity(vTextureCoord + vec2(0.0, uTexelSize.y)).y;
  float B = sampleVelocity(vTextureCoord - vec2(0.0, uTexelSize.y)).y;
  float div = 0.5 * (R - L + T - B);
  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}`;
