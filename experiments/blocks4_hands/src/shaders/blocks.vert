#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

in vec3 aPosOffset;
in vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uPosOrgMap;
uniform sampler2D uVelMap;
uniform sampler2D uDataMap;
uniform sampler2D uColorMap;
uniform float uBound;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec4 vShadowCoord;

#pragma glslify: rotate = require(./glsl-utils/rotate.glsl)

#define axisX vec3(1.0, 0.0, 0.0)

void main(void) {

    vec3 vel = texture(uVelMap, aPosOffset.xy).xyz;
    float scaleSpeed = length(vel);
    scaleSpeed = smoothstep(0.0, 0.3, scaleSpeed);
    scaleSpeed = mix(0.3, 1.0, scaleSpeed);

    vec3 dir = normalize(vel);
    float life = texture(uDataMap, aPosOffset.xy).x;
    float scaleLife = abs(life - 0.5);
    scaleLife = smoothstep(0.5, 0.4, scaleLife);

    vec3 axis = cross(dir, axisX);
    float angle = acos(dot(dir, axisX));


    vec3 posOffset = texture(uPosMap, aPosOffset.xy).xyz;
    vec3 pos = aVertexPosition * aPosOffset.z * scaleLife * scaleSpeed;
    pos.x *= mix(2.0, 4.0, aExtra.y);

    pos = rotate(pos, axis, angle);

    pos += posOffset;
    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;

    vec3 N = rotate(aNormal, axis, angle);
    
    vNormal = N;

    float g = mix(0.7, 1.0, aExtra.x);

    vec2 posOrg = texture(uPosOrgMap, aPosOffset.xy).xy;
    vec2 uv = posOrg / uBound * .5 + .5;

    vec3 color = texture(uColorMap, uv).xyz;
    color = pow(color + 0.2, vec3(1.5));
    // color = mix(color, vec3(g, 0.0, 0.0), .5);

    vColor = color * g;
    vShadowCoord = uShadowMatrix * wsPos;
}