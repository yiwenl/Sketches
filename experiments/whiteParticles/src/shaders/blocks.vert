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
uniform sampler2D uVelMap;
uniform sampler2D uDataMap;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec4 vShadowCoord;

#pragma glslify: rotate = require(./glsl-utils/rotate.glsl)

#define axisX vec3(1.0, 0.0, 0.0)
#define PI 3.141592653589793

void main(void) {

    vec3 vel = texture(uVelMap, aPosOffset.xy).xyz;
    float speed = length(vel);
    float scaleSpeed = smoothstep(0.0, 0.1, speed);
    scaleSpeed = mix(0.2, 1.05, scaleSpeed);

    vec3 dir = normalize(vel);
    vec3 data = texture(uDataMap, aPosOffset.xy).xyz;
    float life = data.x;
    float scaleLife = abs(life - 0.5);
    scaleLife = smoothstep(0.5, 0.4, scaleLife);

    vec3 axis = cross(dir, axisX);
    float angle = acos(dot(dir, axisX));

    vec3 posOffset = texture(uPosMap, aPosOffset.xy).xyz;
    vec3 pos = aVertexPosition * aPosOffset.z * scaleLife * scaleSpeed;
    pos.x *= mix(2.0, 6.0, aExtra.y);
    pos.yz = rotate(pos.yz, data.z);

    pos = rotate(pos, axis, angle);

    pos += posOffset;
    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;

    vec3 N = rotate(aNormal, axis, angle);
    
    vNormal = N;

    float g = mix(0.95, 1.0, aExtra.x);
    vec3 color = vec3(g);
    float t = fract(aExtra.x + aExtra.y + aExtra.z);
    float colMul = mix(.8, 1.2, t);
    float threshold = mix(0.1, 0.25, t);
    t = smoothstep(threshold * .9, threshold, speed);
    color *= mix(vec3(1.0), vec3(colMul, 0.1, 0.0), t);

    vColor = color;

    vShadowCoord = uShadowMatrix * wsPos;
}