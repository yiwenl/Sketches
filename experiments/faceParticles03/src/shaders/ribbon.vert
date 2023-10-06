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

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vPosition;

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
    } else {
        pos = texture(uPosMap9, uv).xyz;
    }


    return pos;
}

void main(void) {

    vec3 pos = vec3(0.0, 0.1, 0.0);
    pos.yz = rotate(pos.yz, -aTextureCoord.y * PI * 2.0);


    vec3 posOffset = getPos(aVertexPosition.y, vec2(0.0));
    pos.x += aTextureCoord.x;


    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
    vPosition = aVertexPosition;
}