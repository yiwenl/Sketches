#version 300 es

#define LUT_FLIP_Y 1


precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uMap;
uniform sampler2D uAOMap;
uniform sampler2D uNoiseMap;
uniform sampler2D uLookupMap;
uniform sampler2D uBlurMap;
uniform sampler2D uDepthMap;
uniform float uRatio;

uniform float uFocus;         // Focus distance
uniform float uNear;          // Camera near plane
uniform float uFar;           // Camera far plane

out vec4 oColor;

vec4 lookup(in vec4 textureColor, in sampler2D lookupTable, float strength) {
    #ifndef LUT_NO_CLAMP
        textureColor = clamp(textureColor, 0.0, 1.0);
    #endif

    mediump float blueColor = textureColor.b * 63.0;

    mediump vec2 quad1;
    quad1.y = floor(floor(blueColor) / 8.0);
    quad1.x = floor(blueColor) - (quad1.y * 8.0);

    mediump vec2 quad2;
    quad2.y = floor(ceil(blueColor) / 8.0);
    quad2.x = ceil(blueColor) - (quad2.y * 8.0);

    highp vec2 texPos1;
    texPos1.x = (quad1.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
    texPos1.y = (quad1.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);

    #ifdef LUT_FLIP_Y
        texPos1.y = 1.0-texPos1.y;
    #endif

    highp vec2 texPos2;
    texPos2.x = (quad2.x * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.r);
    texPos2.y = (quad2.y * 0.125) + 0.5/512.0 + ((0.125 - 1.0/512.0) * textureColor.g);

    #ifdef LUT_FLIP_Y
        texPos2.y = 1.0-texPos2.y;
    #endif

    lowp vec4 newColor1 = texture(lookupTable, texPos1);
    lowp vec4 newColor2 = texture(lookupTable, texPos2);

    lowp vec4 newColor = mix(newColor1, newColor2, fract(blueColor));
    return mix(textureColor, newColor, strength);
}

vec4 lookup(in vec4 textureColor, in sampler2D lookupTable) {
    return lookup(textureColor, lookupTable, 1.0);
}


float normalizeDepth(float depth) {
    return (2.0 * uNear) / (uFar + uNear - depth * (uFar - uNear));
}


void main(void) {
    float depth = texture(uDepthMap, vTextureCoord).r;
    float normalizedDepth = normalizeDepth(depth);
    vec4 color = texture(uMap, vTextureCoord);
    vec4 blurredColor = texture(uBlurMap, vTextureCoord);

    float t = 0.05;
    // Calculate blur amount based on depth difference
    float blurAmount = smoothstep(uFocus - t, uFocus + t, normalizedDepth);
    color = mix(color, blurredColor, blurAmount);

    float ao = texture(uAOMap, vTextureCoord).r;
    ao = mix(ao, 1.0, .2);
    
    color.rgb *= ao;

    vec2 uv = vTextureCoord - .5;
    if(uRatio > 1.0) {
        uv.y /= uRatio;
    } else {
        uv.x *= uRatio;
    }

    float d = length(uv);
    float v = smoothstep(0.3, 0.8, d);
    d = smoothstep(0.2, .8, d);

    float n = texture(uNoiseMap, vTextureCoord).r;
    color.rgb *= mix(1.0 - d * 0.4, 1.0, n);


    color.rgb = pow(color.rgb, vec3(1.0/1.6));

    // dark bottom right
    uv = vTextureCoord;
    uv.y = 1.0 - uv.y;
    d = length(uv);
    d = smoothstep(0.4, 1.2, d);
    color.rgb -= d * 0.4;

    oColor = lookup(color, uLookupMap, 0.35);
    oColor.rgb *= mix(1.1, 0.5, v);
    // oColor = vec4(vec3(ao), 1.0);
    // oColor = vec4(vec3(blurAmount), 1.0);

    // oColor = mix(oColor, blurredColor, step(vTextureCoord.x, .5));
}