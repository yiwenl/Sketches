precision highp float;
varying vec2 vTextureCoord;
uniform vec3 uColor;
uniform float uRatio;
uniform float uSeed;

#pragma glslify: snoise    = require(./glsl-utils/snoise.glsl)

void main(void) {
    vec2 uv = vTextureCoord - .5;
    uv.y /= uRatio;

    // vignette
    float d = length(uv);
    d = smoothstep(0.8, 0.3, d);
    d = mix(0.2, 1.0, d);

    // noise
    float g = smoothstep(-1.0, 1.0, snoise(vec3(uv, uSeed) * 2.0));
    g = mix(0.7, 1.0, g);

    gl_FragColor = vec4(uColor * d * g, 1.0);
}