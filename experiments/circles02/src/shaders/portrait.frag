// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uContrast;

float contrast(float v, float scale) {
    return (v - 0.5) * scale + 0.5;
}

vec3 contrast(vec3 v, float scale) {
    return vec3(
        contrast(v.x, scale),
        contrast(v.y, scale),
        contrast(v.z, scale)
    );
}

void main(void) {
    vec4 color = texture2D(texture, vTextureCoord);
    color.rgb = contrast(color.rgb, uContrast);
    gl_FragColor = color;
}