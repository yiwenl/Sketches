#define SHADER_NAME DOTS_PLANE_VERTEX

precision highp float;
attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec2 uViewport;
uniform float uScale;
uniform float uPointScale;

const float radius = 0.008;

void main(void) {
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition * uScale, 1.0);

	float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
  gl_PointSize = distOffset * uPointScale;
}