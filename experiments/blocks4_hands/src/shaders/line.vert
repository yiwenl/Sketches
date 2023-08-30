// basic.vert

precision highp float;
attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform vec3 uPointA;
uniform vec3 uPointB;
uniform float uThickness;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

vec3 _normalize(vec3 v) {
    float len = length(v);
    if(len == 0.0) return vec3(0.0);
    return v / len;
}

#define xAxis vec3(1.0, 0.0, 0.0)

void main(void) {
    float l = distance(uPointA, uPointB);
    vec3 pos = aVertexPosition;
    pos.x += 0.5;
    pos.x *= l;
    pos.yz *= uThickness;

    vec3 dir = _normalize(uPointB - uPointA);
    vec3 axis = _normalize(cross(dir, xAxis));
    float angle = acos(dot(dir, xAxis));
    pos = rotate(pos, axis, angle);

    pos += uPointA;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
}