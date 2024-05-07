#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec4 aData;

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

void main(void) {
    vec3 pos = aVertexPosition;
    vec3 posOffset = texture(uPosMap, aData.xy).xyz;
    vec3 data = texture(uDataMap, aData.xy).xyz;

    float scale = mix(1.0, 2.0, data.x);
    pos *= scale;

    pos += posOffset;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vTextureCoord = aTextureCoord;
    vNormal = aNormal;

    float g = mix(1.0, 0.75, smoothstep(0.2, 0.8, data.x));
    vColor = vec3(g);
    vShadowCoord = uShadowMatrix * wsPos;
}