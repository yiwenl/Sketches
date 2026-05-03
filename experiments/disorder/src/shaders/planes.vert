#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec3 aPosOffset;
in vec2 aUVOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;
uniform mat3 uModelViewMatrixInverse;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uDataMap;
uniform sampler2D uColorMap;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec4 vShadowCoord;
out vec2 vUVOffset;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#define X_AXIS vec3(1.0, 0.0, 0.0)
#define X_AXIS2 vec2(1.0, 0.0)

void main(void) {
    float scale = mix(0.5, 2.0, aPosOffset.x);
    vec3 pos = aVertexPosition * scale;


    vec3 posOffset = texture(uPosMap, aUVOffset).xyz;
    vec3 dir = normalize(texture(uVelMap, aUVOffset).xyz);
    float angle = acos(dot(dir, X_AXIS));
    // pos.xy = rotate(pos.xy, angle);

    // pos = uModelViewMatrixInverse * pos;


    vec3 axis = cross(dir, X_AXIS);
    pos = rotate(pos, axis, angle);
    pos = uModelViewMatrixInverse * pos;

    pos += posOffset;
    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;

    vColor = texture(uColorMap, aUVOffset).xyz;
    vShadowCoord = uShadowMatrix * wsPos;
    vUVOffset = aPosOffset.yz;
}