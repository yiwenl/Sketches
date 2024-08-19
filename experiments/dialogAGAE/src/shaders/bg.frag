#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform float uRatio;

out vec4 oColor;

void main(void) {
    vec2 uv = vTextureCoord - .5;
    if(uRatio < 1.0) {
        uv.x *= uRatio;
    } else {
        uv.y /= uRatio;
    }
    uv += .5;
    vec4 color = texture(uMap, uv);
    // color.rgb = mix(color.rgb, vec3(1.0), 0.25);

    oColor = color;
}