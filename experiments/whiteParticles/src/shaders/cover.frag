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
    d = smoothstep(0.4, 0.7, d);
    d += n * 0.2;

    n = mix(0.8, 1.0, n);

    oColor = vec4(vec3(n), d);
}