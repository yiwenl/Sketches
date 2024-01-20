#version 300 es

#define LUT_FLIP_Y 1

precision highp float;

uniform sampler2D uMap;       // Normal texture
uniform sampler2D uBlurMap;   // Blurred texture
uniform sampler2D uDepthMap;  // Depth texture
uniform sampler2D uNoiseMap;  // noise texture
uniform sampler2D uLookupMap;  // lookup texture

uniform float uFocus;         // Focus distance
uniform float uNear;          // Camera near plane
uniform float uFar;           // Camera far plane
uniform float uRatio;

in vec2 vTextureCoord;
out vec4 oColor;

float normalizeDepth(float depth) {
    return (2.0 * uNear) / (uFar + uNear - depth * (uFar - uNear));
}


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

void main() {
    float depth = texture(uDepthMap, vTextureCoord).r;
    float normalizedDepth = normalizeDepth(depth);

    // Calculate blur amount based on depth difference
    float blurAmount = abs(normalizedDepth - uFocus);
    // blurAmount = clamp(blurAmount, 0.0, 1.0);
    blurAmount = smoothstep(0.2, 0.4, blurAmount);
    blurAmount = pow(blurAmount, 1.5);
    // blurAmount = smoothstep(0.0, 0.7, blurAmount);

    float t = 0.05;
    blurAmount = smoothstep(uFocus - t, uFocus + t, normalizedDepth);

    vec2 uv = vTextureCoord - .5;
    if(uRatio < 1.0) {
        uv.x *= uRatio;
    } else {
        uv.y /= uRatio;
    }

    float distCenter = length(uv);
    float v = smoothstep(0.6, 0.2, distCenter);
    v = mix(.8, 1.2, v);

    float d = smoothstep(0.5, 0.2, distCenter);
    blurAmount = mix(0.0, blurAmount, d);


    vec4 sharpColor = texture(uMap, vTextureCoord);
    vec4 blurredColor = texture(uBlurMap, vTextureCoord);

    // Mix based on blur amount
    vec4 color = mix(sharpColor, blurredColor, blurAmount);
    color.rgb *= v;
    float n = texture(uNoiseMap, vTextureCoord).r;

    d = smoothstep(0.1, 0.7, distCenter);
    color.rgb += n * d * 0.15;

    // highlight / shadow
    d = 0.1;
    t = distance(uv, vec2(-d, d) * vec2(uRatio, 1.0));
    t = smoothstep(0.25, 0.8, t);
    color.rgb *= mix(1.0, 0.5, t);

    color.rgb = pow(color.rgb, vec3(0.75));
    // color.rgb = pow(color.rgb + 0.2, vec3(1.75));
    color = lookup(color, uLookupMap, 0.25);
    oColor = color;
}
