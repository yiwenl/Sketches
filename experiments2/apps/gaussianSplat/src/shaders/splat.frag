#version 300 es

precision highp float;

in vec2 vQuad;
in vec3 vColor;
in float vOpacity;

out vec4 oColor;

void main(void) {
    // gaussian falloff, vQuad is measured in standard deviations
    float power = -0.5 * dot(vQuad, vQuad);
    float alpha = exp(power) * vOpacity;

    if (alpha < 1.0 / 255.0) discard;

    // premultiplied alpha (pairs with blendFunc(ONE, ONE_MINUS_SRC_ALPHA))
    oColor = vec4(clamp(vColor, 0.0, 1.0) * alpha, alpha);
}
