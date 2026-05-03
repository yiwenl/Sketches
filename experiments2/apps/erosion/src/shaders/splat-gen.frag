#version 300 es

precision highp float;
in vec2 vTextureCoord; // UV coordinates of the quad fragment (0.0 to 1.0)

// Uniforms
uniform float uRadius;       // e.g., 0.1 (Controls the size of the splat in UV space)
uniform float uSplatValue;   // The magnitude of height change (Delta H)
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
    // The center of the rendered fragment is usually vec2(0.5, 0.5) if rendering a quad.
    // If you are rendering points, vTextureCoord will be the UV within the point-sprite.
    // Assuming you render a small quad/point-sprite for each droplet:
    
    // Vector from the center to the current fragment
    vec2 offset = vTextureCoord - uCenterUV;
    
    // Scale the offset by uRadius to normalize the influence range
    // NOTE: If you are drawing a fixed-size quad, uRadius is often implicit. 
    // Let's use the distance directly.
    float distSq = dot(offset, offset);
    float dist = sqrt(distSq);

    // 2. Calculate the Influence Weight
    // The influence drops off quickly outside the defined radius
    float weight = 0.0;
    if (dist < uRadius) {
        // Use a smooth, Gaussian falloff for a realistic water splash
        weight = gaussian(dist, uRadius * 0.5); // Use half the radius for tighter bell curve
    }

    // 3. Apply the Droplet's Height Change (Splat Value)
    // This gives the total amount of height change contributed by this fragment
    float finalChange = weight * uSplatValue;

    // Output the calculated height change
    // Since we use additive blending (gl.ONE, gl.ONE), we only write the change value.
    oColor = vec4(finalChange, finalChange, finalChange, 1.0);
}