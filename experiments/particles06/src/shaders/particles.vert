#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uDataMap;

uniform vec2 uViewport;
uniform vec3 uLight;


out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vPosition;
out vec4 vShadowCoord;
out float vLight;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)
#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)

#define radius 0.005

void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz;
    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;

    float scale = mix(1.0, 4.0, aVertexPosition.x);
    float life = texture(uDataMap, aTextureCoord).x;
    scale *= smoothstep(0.5, 0.3, abs(life - .5));
    
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * scale;

    vPosition = pos;
    vShadowCoord = uShadowMatrix * wsPos;

    // lighting
    float distToLight = distance(uLight, pos) * 0.25;
    float light = clamp(1.0 / (distToLight * distToLight), 0.0, 2.0);
    vLight = mix(0.3, 2.0, light);
}