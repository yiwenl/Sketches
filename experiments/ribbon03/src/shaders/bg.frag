#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMapCurr;
uniform sampler2D uMapPrev;
uniform float uRatio;
uniform float uColorOffset;

out vec4 oColor;

void main(void) {
    vec2 uv = vTextureCoord - .5;
    if(uRatio < 1.0) {
        uv.x *= uRatio;
    } else {
        uv.y /= uRatio;
    }   

    float d = length(uv);
    d = smoothstep(0.6, 0.2, d);

    uv += 0.5;
    // vec4 color = texture(uMap, uv);
    vec4 colorCurr = texture( uMapCurr, uv );
    vec4 colorPrev = texture( uMapPrev, uv );
    vec4 color = mix(colorPrev, colorCurr, uColorOffset);

    color.rgb *= mix(0.7, 1.0, d);

    vec3 colorAdjusted = smoothstep(vec3(0.0), vec3(1.0), color.rgb);
    color.rgb = mix(color.rgb, colorAdjusted, 0.5);

    oColor = color;
}