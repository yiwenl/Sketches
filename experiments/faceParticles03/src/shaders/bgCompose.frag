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
    uv *= .4;
    uv += .5;

    float density = smoothstep(0.0, 3.0, texture2D(uDensityMap, uv).r);
    float noise = snoise(vec3(uv, uSeed + uTime * 0.1));
    density += noise * 0.3;

    color *= mix(uColor0, uColor1, density * 0.3);

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(vec3(density), 1.0);
}