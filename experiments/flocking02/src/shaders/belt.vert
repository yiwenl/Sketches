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
uniform float uScaleOffset;
uniform vec3 uColorMul;

out vec2 vTextureCoord;
out vec3 vColor;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: _normalize    = require(./glsl-utils/_normalize.glsl)
#define PI 3.1415926535897932384626433832795
#define xAxis vec3(1.0, 0.0, 0.0)


vec3 getPos(vec2 uv, float index) {
    vec3 pos;
    if(index <= 0.5) {
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

void main(void) {
    float a = sin(aTextureCoord.x * PI);
    a *= mix(1.0, 0.5, aExtra.x);
    vec3 pos = vec3(0.0, 0.02 * a, 0.0);
    pos.yz = rotate(pos.yz, -aTextureCoord.y * PI * 2.0);

    vec3 curr = getPos(aUVOffset, aVertexPosition.x);
    vec3 next = getPos(aUVOffset, aVertexPosition.x + 1.0);
    vec3 dir = _normalize(next - curr);
    if(length(dir) < 0.0001) {
        dir = vec3(1.0, 0.0, 0.0);
    }

    vec3 axis = cross(dir, xAxis);
    float angle = acos(dot(dir, xAxis));
    pos = rotate(pos, axis, angle);

    pos += curr;

    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;

    vec3 data = texture(uDataMap, aUVOffset).xyz;
    float cycle = data.x;

    float g = abs(cycle - PI);
    g = smoothstep(0.7, 0.2, g);
    g = max(sin(g * PI * 0.5), 0.0);


    g *= mix(.5, 1.5, aExtra.y); // instance different glow
     // min glow grow with strength
    float minGlow = mix(0.15, 1.0, g);
    g *= mix(minGlow, 1.0, aTextureCoord.x);
    g = mix(g, 1.0, .15); // set min glow


    vColor = uColorMul * g;
}