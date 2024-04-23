#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec2 aUV;
in vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uColorMap;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec4 vShadowCoord;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#define axisX vec3(1.0, 0.0, 0.0)

void main(void) {

    vec3 pos = aVertexPosition * mix(1.0, 2.0, aExtra.x);
    vec3 posOffset = texture(uPosMap, aUV).xyz;
    vec3 vel = texture(uVelMap, aUV).xyz;
    float speed = length(vel);
    float scaleSpeed = smoothstep(0.01, 0.2, speed);
    scaleSpeed = mix(0.2, 1.0, scaleSpeed);
    pos *= scaleSpeed;

    vec3 dir = normalize(vel);


    vec3 axis = cross( dir, axisX);
    float angle = acos(dot(dir, axisX));

    pos = rotate(pos, axis, angle);
    vec3 n = rotate(aNormal, axis, angle);

    pos += posOffset;
    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;
    vNormal = n;
    vShadowCoord = uShadowMatrix * wsPos;
    vColor = texture(uColorMap, aExtra.yz).xyz;
}