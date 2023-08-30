#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D uPosMap;
uniform sampler2D uDepthMap;
uniform sampler2D uExtraMap;
uniform sampler2D uDataMap;
uniform vec2 uViewport;
uniform float uPlaneSize;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec3 vPosition;
out vec4 vShadowCoord;

out float vSkip;

#pragma glslify: particleSize    = require(./glsl-utils/particleSize.glsl)
#define radius 0.003

void main(void) {
    vec3 pos = texture(uPosMap, aTextureCoord).xyz;
    float life = texture(uDataMap, aTextureCoord).x;
    vec4 screenPos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(pos, 1.0);

    vec2 uv = screenPos.xy / screenPos.w * .5 + 0.5;
    vec4 colorDpeth = texture(uDepthMap, uv);
    float z = texture(uDepthMap, uv).z;


    float skip = 0.0;
    if(colorDpeth.a < 1.0) {
        // z += 999999.0;
        skip = 1.0;
    }
    pos.z = z;
    vSkip = skip;

    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    vPosition = pos;
    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vShadowCoord = uShadowMatrix * wsPos;

    vec3 extra = texture(uExtraMap, vTextureCoord).rgb;

    float lifeScale = smoothstep(0.0, 0.2, life);
    float r = mix(1.0, 4.0, aVertexPosition.x) * radius * lifeScale;
    gl_PointSize = particleSize(gl_Position, uProjectionMatrix, uViewport, r);

    float g = mix(.5, 1.0, aVertexPosition.y);
    vColor = vec3(g * lifeScale);
    vColor = vec3(1.0);
}