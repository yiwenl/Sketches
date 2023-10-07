#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

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

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec3 vPosition;

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
    } else {
        pos = texture(uPosMap10, uv).xyz;
    }


    return pos;
}

#define xAxis vec3(1.0, 0.0, 0.0)

void main(void) {

    vec3 pos = vec3(0.0, 0.1, 0.0);
    pos.yz = rotate(pos.yz, -aTextureCoord.x * PI * 2.0);


    float iCurr = aVertexPosition.y;
    float iNext = aVertexPosition.y + 1.0;
    vec3 curr = getPos(iCurr, vec2(0.5));
    vec3 next = getPos(iNext, vec2(0.5));

    vec3 dir = _normalize(next - curr);

    vec3 axis = cross(dir, xAxis);
    float theta = acos(dot(dir, xAxis));
    pos = rotate(pos, axis, theta);

    // pos.x += aTextureCoord.y * 5.0;
    pos += curr;


    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vPosition = aVertexPosition;
    vColor = aVertexPosition.yyy / 10.0;
}