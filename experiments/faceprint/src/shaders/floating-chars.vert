// basic.vert

precision highp float;
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec2 uViewport;
uniform float uTime;

varying vec2 vTextureCoord;
varying vec3 vNormal;

const float radius = 0.01;
const float RANGE = 3.0;

void main(void) {
    vec3 pos = aVertexPosition;
    float speed = mix(0.5, 3.0, aNormal.y) * 0.05;
    float zOffset = pos.z - speed * uTime;
    zOffset = mod(zOffset + RANGE, RANGE * 2.0) - RANGE;
    pos.z = zOffset;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;

    float scale = mix(1.0, 4.0, aNormal.z);
    float distOffset = uViewport.y * uProjectionMatrix[1][1] * radius / gl_Position.w;
    gl_PointSize = distOffset * scale;
}