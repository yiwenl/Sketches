// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uTime;

#pragma glslify: curlNoise = require(./fragments/curlNoise.glsl)
#pragma glslify: snoise = require(./fragments/snoise.glsl)

float random (vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

void main(void) {
    vec2 uv = vTextureCoord;
    float base = snoise(vec3(uTime * 0.02, vTextureCoord.yx * 1.25));
    vec3 noise = curlNoise(base + vec3(vTextureCoord, uTime * 0.1));
    float rnd = random(vTextureCoord + uTime) * .5 + .5;
    // rnd = smoothstep(0.5, 1.0, rnd);
    uv.xy += noise.xy * 0.02 * rnd;

    gl_FragColor = texture2D(texture, uv);
}