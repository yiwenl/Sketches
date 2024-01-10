#version 300 es
precision highp float;

uniform sampler2D uMap;       // Normal texture
uniform sampler2D uBlurMap;   // Blurred texture
uniform sampler2D uDepthMap;  // Depth texture

uniform float uFocus;         // Focus distance
uniform float uNear;          // Camera near plane
uniform float uFar;           // Camera far plane
uniform float uRatio;

in vec2 vTextureCoord;
out vec4 oColor;

float normalizeDepth(float depth) {
    return (2.0 * uNear) / (uFar + uNear - depth * (uFar - uNear));
}

void main() {
    float depth = texture(uDepthMap, vTextureCoord).r;
    float normalizedDepth = normalizeDepth(depth);

    // Calculate blur amount based on depth difference
    float blurAmount = abs(normalizedDepth - uFocus);
    // blurAmount = clamp(blurAmount, 0.0, 1.0);
    blurAmount = smoothstep(0.2, 0.4, blurAmount);
    // blurAmount = smoothstep(0.0, 0.7, blurAmount);

    float t = 0.05;
    blurAmount = smoothstep(uFocus - t, uFocus + t, normalizedDepth);

    vec2 uv = vTextureCoord - .5;
    if(uRatio < 1.0) {
        uv.x *= uRatio;
    } else {
        uv.y /= uRatio;
    }

    float d = length(uv);
    float v = smoothstep(0.6, 0.2, d);
    v = mix(.8, 1.2, v);

    d = smoothstep(0.5, 0.2, d);
    blurAmount = mix(0.0, blurAmount, d);


    vec4 sharpColor = texture(uMap, vTextureCoord);
    vec4 blurredColor = texture(uBlurMap, vTextureCoord);

    // Mix based on blur amount
    vec4 color = mix(sharpColor, blurredColor, blurAmount);
    color.rgb *= v;

    // color = mix(color, blurredColor, step(vTextureCoord.x, 0.5));

    oColor = color;

    // oColor = blurredColor;
    // oColor = vec4(vec3(blurAmount), 1.0);
}
