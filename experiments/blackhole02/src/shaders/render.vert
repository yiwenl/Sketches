#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform vec2 uViewport;

uniform sampler2D texturePos;
uniform sampler2D textureExtra;
uniform sampler2D textureData;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec4 vShadowCoord;

const float radius = 0.015;
#pragma glslify: particleSize = require(glsl-utils/particleSize.glsl)

void main(void) {
    vec3 pos = texture(texturePos, aVertexPosition.xy).xyz;
    vec3 extra = texture(textureExtra, aVertexPosition.xy).xyz;
    float life = texture(textureData, aVertexPosition.xy).x;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;


    vColor = vec3(1.0);
    vShadowCoord = uShadowMatrix * wsPos;

    float scale = smoothstep(1.0, .5 + extra.x * 0.1, life);

    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, radius) * mix(0.75, 1.0, extra.z) * scale;
}