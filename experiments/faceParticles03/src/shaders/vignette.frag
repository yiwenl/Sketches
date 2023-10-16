// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform float uRatio;
uniform vec3 uColor;

void main(void) {
    vec2 uv = vTextureCoord - 0.5;
    uv.y /= uRatio;

    float d = length(uv);
    d = smoothstep(0.0, 0.65, d);

    gl_FragColor = vec4(0.0, 0.0, 0.0, d);
    gl_FragColor = vec4(uColor * .1, d);
}