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
uniform mat4 uShadowMatrix;

struct Particle {
    vec4 position;
    vec4 velocity;
    vec4 color;
    vec4 randoms;
    vec4 posOrg;
    vec4 extras;
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
out vec3 vNormal;
out vec3 vOffset;
out vec3 vPosition;
out vec4 vShadowCoord;

#pragma glslify: rotate    = require(./glsl-utils/rotate.glsl)

void main(void) {
    int index = gl_InstanceID;
    Particle p = particle[index];

    float scale = p.extras.y;
    float life = p.extras.z;

    float scaleLife = abs(life - 0.5);
    
    scaleLife = smoothstep(0.5, 0.3, scaleLife);

    float scaleX = mix(2.0, 4.0, p.randoms.x);
    vec3 pos = aVertexPosition * scale * scaleLife;
    pos.x *= scaleX;

    // align to velocity
    vec3 xAxis = vec3(1.0, 0.0, 0.0);
    vec3 dir = normalize(p.velocity.xyz);
    vec3 axis = cross(dir, xAxis);
    float angle = acos(dot(dir, xAxis));
    pos = rotate(pos, axis, angle);

    pos += p.position.xyz;
    gl_Position = uProjection * uView * uModel * vec4(pos, 1.0);

    vPosition = p.position.xyz;
    vTextureCoord = aTextureCoord;

    float t = mix(1.0, 4.0, p.randoms.z) * 20.0;
    float g = sin(life * t) * .5 + .5;
    g = mix(0.6, 2.0, g);

    vColor = p.color.xyz * g;

    g = mix(0.4, 1.0, p.randoms.y);

    // vColor = mix(vec3(g), vColor, p.randoms.x);
    vColor = p.color.xyz;

    vOffset = aOffset;
    vNormal = aNormal;
    vShadowCoord = uShadowMatrix * uModelMatrix * vec4(pos, 1.0);
}