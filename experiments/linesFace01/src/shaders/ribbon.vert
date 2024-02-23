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
uniform sampler2D uFaceMap;
uniform float uTotal;
uniform float uNumSets;
uniform float uIndex;
uniform float uBound;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec4 vShadowCoord;
out float vSkip;

// #pragma glslify: curlNoise    = require(./glsl-utils/curlNoise.glsl)
#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

vec3 getPos(float mIndex, vec2 mUV) {
    float index = mIndex + uIndex;
    index = mod(index, uTotal);

    float tx = mod(index, uNumSets)/uNumSets;
    float ty = floor(index/uNumSets)/uNumSets;
    vec2 uv = mUV + vec2(tx, ty);

    return texture(uPosMap, uv).xyz;
}

#define xAxis vec3(1.0, 0.0, 0.0)
#define PI 3.1415926535897932384626433832795

void main(void) {
    
    vec2 uv = aUVOffset;
    vSkip = 0.0;

    vec3 pos = aVertexPosition * vec3(0.0, 1.0, 1.0);
    // pos.yz *= mix(0.25, 1.0, aExtra.x);
    pos.yz *= aExtra.x;

    float index = aVertexPosition.x;
    vec3 curr = getPos(index, uv);
    vec3 next = getPos(index + 1.0, uv);

    // vec2 uvFace = curr.xy / uBound * .5 + .5;
    // vec4 colorFace = texture(uFaceMap, uvFace);
    // float maxDepth = colorFace.z + .8;
    // if(colorFace.a <= 0.0) {
    //     maxDepth = 0.0;
    // }
    // float s = 1.0;
    // if(colorFace.a <= 0.0) {
    //     s = 0.5;
    // }
    // pos.yz *= s;


    vec3 dir = normalize(next - curr);
    vec3 axis = normalize(cross(dir, xAxis));
    float angle = acos(dot(dir, xAxis));
    pos = rotate(pos, axis, angle);
    vec3 n = aNormal;
    n = rotate(n, axis, angle);


    pos += curr;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;

    vTextureCoord = aTextureCoord;
    vNormal = n;

    float g = mix(.8, 1.0, aExtra.y);
    vec3 color = texture(uColorMap, aExtra.yz).rgb;
    vColor = color * g;
    vShadowCoord = uShadowMatrix * wsPos;
}