#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec3 aPosOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uLocalMatrix;
uniform mat4 uShadowMatrix;

uniform sampler2D uHeightMap;
uniform float uMapSize;


out vec2 vTextureCoord;
out vec3 vNormal;
out vec4 vShadowCoord;
out float vHeight;
out float vDepth;
out vec3 vWorldPos;

void main(void) {
    vec3 pos = aVertexPosition;
    pos.xz += 0.5;
    pos.xz *= aPosOffset.z;
    pos.xz += aPosOffset.xy;

    vec2 uv = pos.xz / (uMapSize*2.0) + 0.5;
    float y = texture(uHeightMap, uv).r;
    pos.y = y;
    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);
    vec4 worldPos = uLocalMatrix * wsPos;
    gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
    vTextureCoord = uv;
    vHeight = y;
    vShadowCoord = uShadowMatrix * wsPos;
    vWorldPos = worldPos.xyz / worldPos.w;
    // Normalize depth to [0, 1] range for writing to texture
    // gl_Position.z / gl_Position.w gives NDC depth in [-1, 1] range
    vDepth = gl_Position.z / gl_Position.w * 0.5 + 0.5;
}