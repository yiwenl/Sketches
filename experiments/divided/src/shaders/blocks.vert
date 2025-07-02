#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec3 aPosOffset;
in vec3 aRandom;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uDataMap;
uniform sampler2D uBgMap;
uniform sampler2D uColorMap;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec4 vShadowCoord;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

#define xAxis vec3(1.0, 0.0, 0.0)

void main(void) {
    vec3 posOffset = texture(uPosMap, aPosOffset.xy).xyz;
    vec3 vel = texture(uVelMap, aPosOffset.xy).xyz;
    float speed = length(vel);
    float pSpeed = smoothstep(0.01, 0.05, speed);
    
    vec3 pos = aVertexPosition * aRandom.x;
    pos.x *= aRandom.y;
    pos *= mix(1.5, 0.2, pSpeed);
    float scale = mix(0.5, 1.0, aPosOffset.z);


    vec3 dir = normalize(vel);
    vec3 axis = cross(dir, xAxis);
    float theta = acos(dot(dir, xAxis));
    pos = rotate(pos, axis, theta);


    pos += posOffset;


    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;

    vec3 n = rotate(aNormal, axis, theta);

    vNormal = normalize(n);

    // shadow 
    vShadowCoord = uShadowMatrix * wsPos;

    // color
    vec4 screenPos = uProjectionMatrix * uViewMatrix * vec4(posOffset, 1.0);
    vec2 uv = (screenPos.xy / screenPos.w) * 0.5 + 0.5;
    float g = texture(uBgMap, uv).x;


    uv = fract(aRandom.xy + aRandom.zy);
    vec3 color = texture(uColorMap, uv).xyz;
    if(g < 0.5) {
        color = vec3(1.0) - color;
    }

    // vColor = vec3(mix(1.0, .2, g) * mix(0.1, 1.0, pSpeed));
    // vColor = vec3(mix(1.0, .2, g));
    vColor = color;

}