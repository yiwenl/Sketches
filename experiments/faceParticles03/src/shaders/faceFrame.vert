#version 300 es

precision highp float;
in vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec3 uTranslate;

out vec4 vWorldPosition;
out vec4 vViewPosition;

void main(void) {
    vec3 pos = aVertexPosition * 8.0 + uTranslate;
    pos.z -= 4.0;

    vWorldPosition = uModelMatrix * vec4(pos, 1.0);
    vViewPosition = uViewMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * vViewPosition;
}