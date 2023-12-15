#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uPaperMap;
uniform float uRatio;
out vec4 oColor;

void main(void) {
    vec2 uv = vTextureCoord;
    if(uRatio > 1.0) {
        uv.y /= uRatio;
    } else {
        uv.x *= uRatio;
    }
    float paper = texture(uPaperMap, uv).r;
    paper = mix(0.5, 1.0, paper);

    vec4 color = texture(uMap, vTextureCoord);
    color.rgb *= paper;


    // vignette
    uv = abs(vTextureCoord - 0.5);
    if(uRatio > 1.0) {
        uv.y /= uRatio;
    } else {
        uv.x *= uRatio;
    }
    float d = length(uv);
    d = smoothstep(0.6, 0.3, d);
    color.rgb *= mix(0.5, 1.0, d);

    oColor = color;
}