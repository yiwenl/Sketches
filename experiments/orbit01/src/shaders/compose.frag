#version 300 es

precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uBlurMap;
uniform sampler2D uNoiseMap;

uniform float uRatio;

out vec4 oColor;

void main(void) {
    vec2 uv = vTextureCoord - .5;

    if(uRatio < 1.0)
        uv.y /= uRatio;
    else
        uv.x *= uRatio;


    float noise = texture(uNoiseMap, uv * 2.0).r;
    vec2 center = vec2(0.0);

    float d = distance(uv, center);
    // noise *= mix(0.0, 1.0, d);

    float v = smoothstep(1.0, 0.6, d);

    float light = distance(uv, vec2(0.2));
    light = smoothstep(0.0, 0.5, light);
    light = pow(light, 3.0);
    light = mix(1.7, .8, light);

    // d = smoothstep(0.5, 0.1, d);
    d = smoothstep(0.4, 0.0, d);
    d = pow(d, 2.0);

    vec4 color = texture(uMap, vTextureCoord);
    vec4 blur = texture(uBlurMap, vTextureCoord);

    color = mix(blur, color, d);

    vec3 adjustedColor = smoothstep(vec3(0.0), vec3(1.0), color.rgb);
    color.rgb = mix(color.rgb, adjustedColor, mix(0.7, 0.0, d));

    color.rgb *= light;
    color.rgb += noise * 0.15;
    color.rgb *= mix(0.4, 1.0, v);

    oColor = color;
    
    // oColor = vec4(vec3(noise), 1.0);
    // oColor = vec4(vec3(d), 1.0);
    // oColor = vec4(vec3(light - 1.0), 1.0);
}