#version 300 es

#define NUM_PARTICLES ${NUM_PARTICLES}

precision highp float;
in vec3 aVertexPosition;
in vec2 aTextureCoord;
in vec3 aNormal;
in vec3 aOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

struct Particle {
    vec4 position;
    vec4 color;
};

layout(std140) uniform Particles {
    Particle particle[NUM_PARTICLES];
};

layout(std140) uniform Transform {
    mat4 uModel;
    mat4 uView;
    mat4 uProjection;
};


out vec2 vTextureCoord;
out vec3 vColor;
out vec3 vOffset;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

void main(void) {
    // int index = int(aOffset.x);
    int index = gl_InstanceID;
    Particle p = particle[index];
    vec3 pos = aVertexPosition * p.position.w;
    pos += p.position.xyz;
    gl_Position = uProjection * uView * uModel * vec4(pos, 1.0);

    vTextureCoord = aTextureCoord;
    vColor = p.color.xyz;

    vOffset = aOffset;
}