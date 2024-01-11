#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec3 aPosOffset;
in vec3 aAxis;
in vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uTime;
uniform float uBound;
uniform float uFloor;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)

void main(void) {
    float scale = mix(0.5, 2.0, aExtra.x);
    vec3 pos = aVertexPosition * scale;

    float time = aExtra.x + mix(1.0, 3.0, aExtra.y) * uTime;
    pos = rotate(pos, aAxis, time);


    vec3 posOffset = aPosOffset;
    vec3 noisePos = (aPosOffset + aExtra * time) * 0.2;
    float nx = snoise(noisePos.xyz);
    float ny = snoise(noisePos.yzx);
    float nz = snoise(noisePos.zxy);
    vec3 wind = vec3(1.0, -1.0, 0.0) * mix(0.5, 1.0, aExtra.z);
    posOffset += wind * time;

    posOffset += vec3(nx, -ny, nz) * 0.5;
    posOffset.xz = mod(posOffset.xz + uBound, uBound * 2.0) - uBound;
    posOffset.y = mod(posOffset.y, uBound) + uFloor;

    pos += posOffset;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;

    vec3 n = aNormal;
    n = rotate(n, aAxis, time);
    vNormal = n;

    vColor = vec3(1.0);
}