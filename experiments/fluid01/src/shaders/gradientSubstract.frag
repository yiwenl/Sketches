precision highp float;
precision mediump sampler2D;

varying vec2 vTextureCoord;
uniform vec2 texelSize;
uniform sampler2D pressure;
uniform sampler2D velocity;

void main() {
  float pL = texture2D(pressure, vTextureCoord - vec2(texelSize.x, 0.0)).x;
  float pR = texture2D(pressure, vTextureCoord + vec2(texelSize.x, 0.0)).x;
  float pB = texture2D(pressure, vTextureCoord - vec2(0.0, texelSize.y)).x;
  float pT = texture2D(pressure, vTextureCoord + vec2(0.0, texelSize.y)).x;
  vec2 v = texture2D(velocity, vTextureCoord).xy;
  gl_FragColor = vec4(v - vec2(pR - pL, pT - pB), 0.0, 1.0);
}