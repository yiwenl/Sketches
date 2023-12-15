#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aPosOffset;
in vec3 aExtra;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uSeed;
uniform float uTime;
uniform vec2 uOffset;

uniform sampler2D uMap;

out vec2 vTextureCoord;
out vec3 vExtra;
out float vGrey;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)

void main(void) {
    vec3 pos = aVertexPosition;
    pos.xy += aPosOffset.xy + uOffset;
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);
    vTextureCoord = aTextureCoord;
    vExtra = aExtra;

    // vGrey = vExtra.x;
    vec3 posNoise = vec3(aPosOffset.xy, uSeed);
    posNoise.y += uTime * aPosOffset.z;

    float g = snoise(posNoise * 0.5);


    vec4 screenPos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosOffset.xy, 0.0, 1.0);
    vec2 uv = screenPos.xy / screenPos.w * .5 + .5;
    float map = texture(uMap, uv).g;

    float t = 0.8;
    vGrey = smoothstep(-t, t, g) * (1.0 - map);
    
}