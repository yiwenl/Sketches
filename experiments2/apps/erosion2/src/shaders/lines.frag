#version 300 es

precision highp float;
in vec2 vTextureCoord;
in vec3 vNormal;

out vec4 oColor;

#define LIGHT vec3(1.0, 0.2, 1.0)

#define BASE_COLOR vec3(1.0, .99, .97) * .92

void main(void) {
    float diffuse = dot(vNormal, normalize(LIGHT));
    diffuse = max(diffuse, 0.0);
    diffuse = mix(0.5, 1.0, diffuse);

    oColor = vec4(vec3(diffuse) * BASE_COLOR, 1.0);
}