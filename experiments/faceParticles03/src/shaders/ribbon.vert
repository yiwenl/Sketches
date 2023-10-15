#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec2 aUVOffset;
in vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

uniform sampler2D uPosMap0;
uniform sampler2D uPosMap1;
uniform sampler2D uPosMap2;
uniform sampler2D uPosMap3;
uniform sampler2D uPosMap4;
uniform sampler2D uPosMap5;
uniform sampler2D uPosMap6;
uniform sampler2D uPosMap7;
uniform sampler2D uPosMap8;
uniform sampler2D uPosMap9;
uniform sampler2D uPosMap10;
uniform sampler2D uPosMap11;
uniform sampler2D uPosMap12;


uniform sampler2D uDataMap;
uniform sampler2D uColorMap;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec3 vPosition;
out float vSkip;

#pragma glslify: _normalize    = require(./glsl-utils/_normalize.glsl)
#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#define PI 3.14159265

vec3 getPos(float index, vec2 uv) {
    vec3 pos;
    if(index < 0.5) {
        pos = texture(uPosMap0, uv).xyz;
    } else if(index < 1.5) {
        pos = texture(uPosMap1, uv).xyz;
    } else if(index < 2.5) {
        pos = texture(uPosMap2, uv).xyz;
    } else if(index < 3.5) {
        pos = texture(uPosMap3, uv).xyz;
    } else if(index < 4.5) {
        pos = texture(uPosMap4, uv).xyz;
    } else if(index < 5.5) {
        pos = texture(uPosMap5, uv).xyz;
    } else if(index < 6.5) {
        pos = texture(uPosMap6, uv).xyz;
    } else if(index < 7.5) {
        pos = texture(uPosMap7, uv).xyz;
    } else if(index < 8.5) {
        pos = texture(uPosMap8, uv).xyz;
    } else if(index < 9.5) {
        pos = texture(uPosMap9, uv).xyz;
    } else if(index < 10.5) {
        pos = texture(uPosMap10, uv).xyz;
    } else if(index < 11.5) {
        pos = texture(uPosMap11, uv).xyz;
    } else {
        pos = texture(uPosMap12, uv).xyz;
    }


    return pos;
}

#define xAxis vec3(1.0, 0.0, 0.0)

void main(void) {
    float r = sin(aTextureCoord.y * PI) * 0.02 * mix(0.5, 1.5, aExtra.z);
    float life = texture(uDataMap, aUVOffset).x;
    float lifeScale = abs(life - 0.5);
    lifeScale = smoothstep(0.3, 0.1, lifeScale);
    // vSkip = 1.0 - lifeScale;
    // r *= lifeScale;

    float skip = 0.0;

    float iCurr = aVertexPosition.y;
    float iNext = aVertexPosition.y + 1.0;
    vec3 curr = getPos(iCurr, aUVOffset);
    vec3 next = getPos(iNext, aUVOffset);

    float dCurr = length(curr);
    float dNext = length(next);

    if(distance(dCurr, dNext) > .1 && dNext < dCurr) {
        skip = 1.0;
    }

    float t = 0.001;
    if(dCurr <= t || dNext <= t) {
        skip = 1.0;
    }

    vSkip = skip;


    vec3 pos = vec3(0.0, r, 0.0);
    pos.yz = rotate(pos.yz, -aTextureCoord.x * PI * 2.0);

    vec3 dir = _normalize(next - curr);

    vec3 axis = cross(dir, xAxis);
    float theta = acos(dot(dir, xAxis));
    pos = rotate(pos, axis, theta);
    pos += curr;

    vec3 N = vec3(0.0, 1.0, 0.0);
    N.yz = rotate(N.yz, -aTextureCoord.x * PI * 2.0);
    vNormal = rotate(N, axis, theta);


    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    vec3 color = texture(uColorMap, aExtra.xy).xyz;
    color = smoothstep(vec3(0.0), vec3(1.0), color);
    vColor = color;
}