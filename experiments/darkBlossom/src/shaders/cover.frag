#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform float uRatio;
uniform vec3 uColor;

out vec4 oColor;

void main(void) {
    float n = texture(uMap, vTextureCoord * 8.0).r; 

    vec2 uv = vTextureCoord - .5;
    if(uRatio > 1.0) {
        uv.x *= uRatio;
    } else {
        uv.y /= uRatio;
    }   

    float d = length(uv);
    d = smoothstep(0.3, 0.9, d);

    d -= n;
    d = mix(d, 1.0, .3);

    oColor = vec4(uColor, d * .5);
}