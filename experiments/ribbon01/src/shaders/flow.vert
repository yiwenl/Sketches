#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform vec2 uViewport;
uniform float uTime;
uniform float uBound;

out vec2 vTextureCoord;
out vec3 vExtra;
out vec3 vColor;

#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)
#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)

#define radius 0.015

void main(void) {
    vec3 pos = aVertexPosition;

    vec3 vel = mix(aNormal, vec3(1.0), .5);
    vel.z *= 0.1;
    float speed = mix(0.5, 3.0, aNormal.x) * 0.2;

    pos += vel * uTime * speed;
    pos = mod(pos + uBound, uBound * 2.0) - uBound;


    float scaleBound = 1.0;
    float scale = abs(pos.x) / uBound;
    scaleBound *= smoothstep(1.0, .9, scale);
    scale = abs(pos.y) / uBound;
    scaleBound *= smoothstep(1.0, .9, scale);

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    vExtra = aNormal;

    scale = mix(0.5, 2.0, aNormal.x) * scaleBound;

    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius * scale);

    // color 
    float g = mix(0.15, 1.0, aNormal.z);
    vColor = vec3(g);
}