#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
// uniform sampler2D uNoiseMap;
uniform float uTime;

out vec4 oColor;

#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)

void main(void) {
    // float noise = texture(uNoiseMap, vTextureCoord).r;
    float density = smoothstep(0.0, 1.0, texture(uMap, vTextureCoord).r);

    float time = uTime;
    float s = 1000.0 * mix(2.0, 0.1, density);
    float nx = snoise(vec3(vTextureCoord * s, time));
    float ny = snoise(vec3(time, vTextureCoord.yx * s));

    vec2 uv = vTextureCoord + vec2(nx, ny) * 0.05 * (1.0 - density);
    // vec4 colorPaper = texture(uPaperMap, vTextureCoord);
    vec4 color = texture(uMap, uv);
    float g = smoothstep(0.0, 1.0, color.r);
    // g = pow(g, 4.0);

    float d = distance(vTextureCoord, vec2(.5));
    d = smoothstep(0.5, .4, d);


    float noise = mod(nx + ny + 2.0, 1.0);
    g *= d * .75 * noise;
    oColor = vec4(vec3(1.0, 1.0, .94), g);
    // oColor = vec4(vec3(noise), 1.0);
}