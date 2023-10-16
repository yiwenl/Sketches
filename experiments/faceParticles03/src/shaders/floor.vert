#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uShadowMatrix;

out vec2 vTextureCoord;
out vec4 vShadowCoord;

void main(void) {
    vec3 pos = aVertexPosition;
    pos.y -= 5.0;
    vec4 wsPos = uModelMatrix * vec4(pos, 1.0);

    gl_Position = uProjectionMatrix * uViewMatrix * wsPos;
    vShadowCoord = uShadowMatrix * wsPos;

    vTextureCoord = aTextureCoord;
}