// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uFluidMap;

void main(void) {
    float colorPrev = texture2D(uMap, vTextureCoord).r;
    float colorFluid = clamp(texture2D(uFluidMap, vTextureCoord).r, 0.0, 1.0);

    float t = 0.2;
    float r = 0.05;
    colorFluid = smoothstep(t, t + r, colorFluid);

    float color = colorFluid + colorPrev * .9;
    color = mod(color, 100.0);

    gl_FragColor = vec4(vec3(color), 1.0);
}