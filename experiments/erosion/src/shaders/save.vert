#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform sampler2D uHeightMap;

out vec3 vPosition;
out vec3 vNormal;
out vec3 vData;

void main(void) {
    vec2 uv = aVertexPosition.xy * .5 + .5;
    uv.y = 1.0 - uv.y;
    float h = texture(uHeightMap, uv).r;
    gl_Position = vec4(aTextureCoord, 0.0, 1.0);
    vPosition = vec3(aVertexPosition.x, h, aVertexPosition.y);
    vNormal = aNormal;
    vData = aVertexPosition;

    gl_PointSize = 1.0;
}