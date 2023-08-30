precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
  vColor = aColor;
}