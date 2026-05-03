#version 300 es

precision highp float;
in vec2 vTextureCoord; // UV coordinates of the quad fragment (0.0 to 1.0)

// Uniforms
uniform float uRadius;       // e.g., 0.1 (Controls the size of the splat in UV space)
uniform vec2 uCenterUV;      // The UV position of the droplet, typically vec2(0.5, 0.5)

out vec4 oColor;

// --- Gaussian Influence Function ---
// Calculates the weight based on distance from the center
float gaussian(float dist, float radius) {
    // The exponent of the Gaussian function: exp(-a * dist^2)
    // We use a constant related to the radius for falloff control.
    float sigma2 = radius * radius;
    return exp(-(dist * dist) / (2.0 * sigma2));
}

void main(void) {
    // 1. Calculate Distance from the Center
    float dist = distance(vTextureCoord, uCenterUV);

    // 2. Calculate the Influence Weight
    // The influence drops off quickly outside the defined radius
    float weight = smoothstep(uRadius, 0.0, dist);
    weight = pow(weight, 8.0);
    

    // Output the calculated height change
    // Since we use additive blending (gl.ONE, gl.ONE), we only write the change value.
    oColor = vec4(vec3(weight), 1.0);
}