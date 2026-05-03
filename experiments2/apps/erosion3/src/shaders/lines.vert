#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec3 aColor;
in vec2 aIndex;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uLocalMatrix;
uniform mat4 uShadowMatrix;
uniform mat3 uNormalMatrix;
uniform vec3 uCameraPosition;

uniform sampler2D uScreenDepthMap;

out vec2 vTextureCoord;
out vec3 vNormal;
out vec3 vColor;
out vec4 vShadowCoord;
out float vIndex;
out float vSkip;

void main(void) {
    vec4 wsPos = uModelMatrix * vec4(aVertexPosition, 1.0); 
    gl_Position = uProjectionMatrix * uViewMatrix * uLocalMatrix * wsPos;
    vShadowCoord = uShadowMatrix * wsPos;
    vTextureCoord = aTextureCoord;

    vNormal = aNormal;
    vColor = aColor;
    vIndex = aIndex.x;


    vec2 screenPos = gl_Position.xy / gl_Position.w * .5 + .5;
    float screenDepth = gl_Position.z / gl_Position.w * .5 + .5;

    float depth = texture(uScreenDepthMap, screenPos).r;
    vSkip = step(depth, screenDepth - 0.01);
}