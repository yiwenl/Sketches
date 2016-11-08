// basic.vert

#define SHADER_NAME DOTS_PLANE_VERTEX

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vNormal;

void main(void) {
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);

    vNormal = aNormal;
}