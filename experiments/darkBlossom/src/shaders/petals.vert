#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec2 aUVOffset;
in vec4 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uDataMap;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec4 vShadowCoord;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

#define PI 3.1415926535897932384626433832795

void main(void) {
    vec3 data = texture(uDataMap, aUVOffset).xyz;
    float isFlying = data.x;
    float rotation = data.y;


    vec3 pos = aVertexPosition;

    // scale
    vec2 scale = mix(aExtra.zw, vec2(1.0), .6);
    pos.xz *= scale;


    pos.xz= rotate(pos.xz, aExtra.w * PI * 2.0);
    pos *= mix(1.0, 3.0, aExtra.w);
    vec3 axis = normalize(aExtra.xyz-0.5);
    pos = rotate(pos, axis, rotation);
    vec3 n = aNormal;
    n = rotate(n, axis, rotation);

    vec3 posOffset = texture(uPosMap, aUVOffset).xyz;
    pos += posOffset;

    pos.y += 0.01;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;

    vTextureCoord = aTextureCoord;
    vNormal = n;

    vShadowCoord = uShadowMatrix * wsPos;

    // vColor = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), isFlying);
    float g = mix(.9, 1.0, aExtra.y);
    vColor = vec3(g);
}