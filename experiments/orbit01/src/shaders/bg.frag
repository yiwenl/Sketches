#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform float uRatio;
uniform vec3 uColor;

out vec4 oColor;

void main(void) {
    vec2 uv = vTextureCoord - .5;

    if(uRatio < 1.0)
        uv.y /= uRatio;
    else
        uv.x *= uRatio;

    vec2 center = vec2(0.05);

    float d = distance(uv, center);
    d = smoothstep(0.7, .4, d);

    d = mix(0.5, 1.0, d);

    oColor = vec4(uColor * d, 1.0);    
}