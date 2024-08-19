#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec2 aUVOffset;
in vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uColorMap;

uniform float uTotal;
uniform float uNumSets;
uniform float uIndex;

out vec2 vTextureCoord;
out vec2 vUV;
out vec3 vNormal;
out vec3 vColor;
out vec3 vPosition;
out vec3 vExtra;
out vec4 vShadowCoord;

// #pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)
#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

vec3 getData(float mIndex, vec2 mUV, sampler2D map) {
    float index = mIndex + uIndex;
    index = mod(index, uTotal);

    float tx = mod(index, uNumSets)/uNumSets;
    float ty = floor(index/uNumSets)/uNumSets;
    vec2 uv = mUV + vec2(tx, ty);

    return texture(map, uv).xyz;
}

vec3 getPos(float mIndex, vec2 mUV) {
    return getData(mIndex, mUV, uPosMap);
}

vec3 getPos(float mIndex, vec2 mUV, sampler2D map) {
    return getData(mIndex, mUV, map);
}


#define xAxis vec3(1.0, 0.0, 0.0)
#define PI 3.1415926535897932384626433832795

void main(void) {
    vec2 uv = aUVOffset;
    vec3 pos = aVertexPosition * vec3(0.0, 1.0, 1.0);
    pos.yz *= aExtra.x;


    float index = aVertexPosition.x;
    vec3 curr = getPos(index, uv);
    vec3 next = getPos(index + 1.0, uv);

    vec3 dir = normalize(next - curr);
    vec3 axis = normalize(cross(dir, xAxis));
    float angle = acos(dot(dir, xAxis));
    pos = rotate(pos, axis, angle);
    vec3 n = aNormal;
    n = rotate(n, axis, angle);

    pos += curr;


    vec4 wsPos = vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vShadowCoord = uShadowMatrix * vec4(pos, 1.0);

    vTextureCoord = aTextureCoord;
    vNormal = n;

    // float g = mix(0.85, 1.0, aExtra.y);
    // vExtra = aExtra;

    // color
    uv = gl_Position.xy/gl_Position.w * .5 + .5;
    float g = texture(uColorMap, uv).x;
    vColor = vec3(mix(1.0, .2, g));
}