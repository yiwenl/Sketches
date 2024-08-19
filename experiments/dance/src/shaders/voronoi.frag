#version 300 es
precision highp float;
in vec2 vTextureCoord;

uniform float uSeed; // Uniform variable to pass the time
uniform float uScale;

// Function to generate random values based on input vector
float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

// Function to generate a random color based on input vector
vec3 randomColor(vec2 st) {
    return vec3(random(st), random(st + vec2(1.0)), random(st + vec2(2.0)));
}
out vec4 oColor;


void main() {
    vec2 st = vTextureCoord * uScale; // Scale texture coordinates to get larger Voronoi cells

    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float min_dist = 1.0; // Minimum distance to the closest point
    vec2 min_point; // Closest point

    // Loop through the surrounding cells
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = i_st + neighbor + random(i_st + neighbor);
            vec2 diff = f_st - neighbor - random(i_st + neighbor);
            float dist = length(diff);

            if (dist < min_dist) {
                min_dist = dist;
                min_point = i_st + neighbor;
            }
        }
    }

    // Assign a random color to each cell
    vec3 color = randomColor(min_point);

    oColor = vec4(color, 1.0);
}
