#version 300 es

precision highp float;
in vec2 vTextureCoord;
in float vSkip;
in float vGrey;
in vec3 vColor;
uniform sampler2D uMap;
uniform vec3 uColor;
out vec4 oColor;

void main(void) {
    if(vSkip > .5) {
        discard;
    }
    
    vec4 color = texture(uMap, vTextureCoord);
    float g = step(vGrey, color.r);
    oColor = vec4(uColor, g * color.a);
}