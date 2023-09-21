precision highp float;
attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uPosA;
uniform vec3 uPosB;

void main(void) {
  vec3 pos = mix(uPosA, uPosB, aVertexPosition.x);
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
}