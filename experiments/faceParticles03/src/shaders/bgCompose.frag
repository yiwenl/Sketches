// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uDensityMap;
uniform float uRatio;
uniform float uSeed;
uniform float uTime;

uniform vec3 uColor0;
uniform vec3 uColor1;

#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)

#define NUM 3

void main(void) {
    vec3 color = texture2D(uMap, vTextureCoord).rgb;

    vec2 uv = vTextureCoord - .5;
    uv.y /= uRatio;

    float d = length(uv);
    d = smoothstep(0.5, 0.0, d);
    uv *= .4;
    uv += .5;

    float noise = snoise(vec3(uv * 3.0, uSeed + uTime * 0.2));
    noise *= d * 0.2;
    color += noise;

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(vec3(density), 1.0);
}