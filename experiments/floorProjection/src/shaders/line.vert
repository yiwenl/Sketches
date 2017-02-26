// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uPos;
uniform vec3 uTarget;

varying vec3 vNormal;

void main(void) {

	vec3 position = mix(uPos, uTarget, aVertexPosition.x);
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);
    vNormal = aNormal;
}