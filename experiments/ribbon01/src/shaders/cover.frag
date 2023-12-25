#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform float uRatio;
out vec4 oColor;

void main(void) {
    float n = texture(uMap, vTextureCoord * 4.0).r; 

    vec2 uv = vTextureCoord - .5;
    if(uRatio > 1.0) {
        uv.x *= uRatio;
    } else {
        uv.y /= uRatio;
    }

    float d = length(uv);
    d = smoothstep(0.2, 0.8, d);
    d = mix(d, 1.0, .1);
    d += n * 0.2;

    // n = mix(0.8, 1.0, n);
    n *= 0.2;

    oColor = vec4(vec3(n), d * .3);
}