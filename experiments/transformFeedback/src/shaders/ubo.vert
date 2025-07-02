#version 300 es

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

layout(std140) uniform Transform {
    mat4 uModel;
    mat4 uView;
    mat4 uProjection;
};

out vec2 vTextureCoord;
out vec3 vNormal;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

void main(void) {
    // gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uProjection * uView * uModel * vec4(aVertexPosition, 1.0);

    vTextureCoord = aTextureCoord;
    vNormal = aNormal;
}