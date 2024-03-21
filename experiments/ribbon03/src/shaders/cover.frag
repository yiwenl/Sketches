#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform float uRatio;
out vec4 oColor;

void main(void) {
    if(vTextureCoord.x > .5) discard;
    float n = texture(uMap, vTextureCoord * 4.0).r; 

    vec2 uv = vTextureCoord - .5;
    if(uRatio > 1.0) {
        uv.x *= uRatio;
    } else {
        uv.y /= uRatio;
    }

    float d = length(uv);
    d = smoothstep(0.2, 0.8, d);
    d = mix(d, 1.0, .1);
    d += n * 0.2;

    // n = mix(0.8, 1.0, n);
    n *= 0.2;


    float t = distance(uv, vec2(-0.5*uRatio, 0.5));
    t = smoothstep(1.0, 2.5, t);

    d += t * 1.5;
    

    oColor = vec4(vec3(n), d * .3);
    // oColor = vec4(vec3(t), 1.0);

    // oColor = vec4(vTextureCoord, 0.0, 1.0);
}