#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec3 aExtra;

// instancing
in vec3 aAxis;
in vec3 aPosOffset;
in vec3 aRandom;


uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform vec2 uViewport;
uniform float uTime;
uniform float uTotal;

out vec4 vShadowCoord;
out float vSkip;


#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)
#define radius 0.002

void main(void) {
    float t = fract(aRandom.y + aRandom.z);
    t = mix(0.5, 2.0, t) * 0.5;
    vec3 pos = rotate(aVertexPosition, aAxis, aRandom.x + uTime * t);
    pos += aPosOffset;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;

    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * aExtra.x;    
    vShadowCoord = uShadowMatrix * wsPos;

    float minScale = 0.1;
    t = abs(aVertexPosition.y) / .5;
    float scale = mix(minScale, 1.0, aRandom.y);
    float skipY = step(scale, t);

    t = abs(aVertexPosition.z) / .5;
    scale = mix(minScale, 1.0, aRandom.z);
    float skipZ = step(scale, t);

    vSkip = max(skipY, skipZ);
    
}