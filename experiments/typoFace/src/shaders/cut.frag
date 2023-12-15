#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uFaceMap;
uniform float uRatio;
uniform float uCutoff;

out vec4 oColor;

void main(void) {
    vec2 uv = vTextureCoord - .5;
    if(uRatio > 1.0) {
        uv.y /= uRatio;
    } else {
        uv.x *= uRatio;
    }
    uv += .5;

    vec4 color = texture(uMap, uv);

    vec2 uvCut = vTextureCoord - .5;
    uvCut = uvCut * .9 + 0.5;
    float f = texture(uFaceMap, uvCut).g;

    // color.rgb = clamp(color.rgb, vec3(0.0), vec3(.9));
    float g = color.r;
    // g = smoothstep(0.3, .8, g);
    g = smoothstep(0.0, .9, g);
    g = pow(g, 2.0);
    g -= f * uCutoff;
    g *= .95;


    oColor = vec4(vec3(g), 1.0);
    // oColor = vec4(vec3(f), 1.0);
}