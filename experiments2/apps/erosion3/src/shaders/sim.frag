#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uVelMap;
uniform sampler2D uHeightMap;

// Global Uniforms
uniform float uMapSize;        
uniform float uTimeStep;       
uniform float uMinSlope;

// Constants
#define k_initialWater 1.0
#define k_minVolume 0.01

// Parameters
uniform float uGravity;
uniform float uInertia;
uniform float uEvaporationRate;
uniform float uErosionRate;
uniform float uDepositionRate;


layout(location = 0) out vec4 oColor0;
layout(location = 1) out vec4 oColor1;
layout(location = 2) out vec4 oColor2;

// --- Helper function to read the height map (Adjusted for -uMapSize to uMapSize) ---
float readHeight(vec2 p) {
    vec2 uv = (p + uMapSize) / (2.0 * uMapSize); 
    return texture(uHeightMap, uv).r;
}

// --- Pseudo-random function for generating random respawn positions ---
float hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p.x) * 43758.5453123 + sin(p.y) * 43758.5453123);
}

vec2 randomPosition(vec2 seed) {
    float randX = hash(seed + vec2(0.0, 0.0));
    float randY = hash(seed + vec2(1.0, 0.0));
    return vec2(
        (randX * 2.0 - 1.0) * uMapSize,
        (randY * 2.0 - 1.0) * uMapSize
    );
}

void main(void) {
    vec3 data0 = texture(uPosMap, vTextureCoord).xyz;
    vec3 data1 = texture(uVelMap, vTextureCoord).xyz;

    vec2 pos = data0.xy;
    float water = data0.z;
    float oldWater = water;
    vec2 oldDir = data1.xy; 
    float sediment = data1.z;


    // --- Droplet Flow Calculation ---
    // (Gradient and Direction calculation remains the same)
    // Calculate delta based on texture size to ensure consistent sampling
    ivec2 texSize = textureSize(uHeightMap, 0);
    // Convert 1 texel in UV space to world space
    float delta = (2.0 * uMapSize) / float(texSize.x);

    float h_c = readHeight(pos); // Read current height for later use
    float h_l = readHeight(pos + vec2(-delta, 0.0));
    float h_r = readHeight(pos + vec2( delta, 0.0));
    float h_u = readHeight(pos + vec2( 0.0, -delta));
    float h_d = readHeight(pos + vec2( 0.0,  delta));

    vec2 gradient = vec2(h_r - h_l, h_d - h_u) / (2.0 * delta);
    // Calculate the slope magnitude
    float G = length(gradient);

    // Apply a minimum slope threshold
    float effectiveG = max(0.0, G - uMinSlope); 
    // Note: We don't just clamp G, but subtract a threshold to enforce a wider flat zone.
    vec2 gravityForce = (-gradient / G) * effectiveG * uGravity; // Use the direction of the original gradient, but scale by effectiveG
    
    // We use the magnitude of the gravity force as a proxy for velocity/stream power
    float speed = effectiveG;

    vec2 newDir = oldDir * uInertia + gravityForce * (1.0 - uInertia);
    vec2 newPos = pos + newDir * uTimeStep;

    // --- 1. Sediment Calculation (Erosion/Deposition) ---
    float capacity = max(0.0, speed * water);
    float deltaSediment = 0.0;

    float sedimentDiff = capacity - sediment;


    if(sedimentDiff > 0.0) {
        
        deltaSediment = uErosionRate * sedimentDiff * water * uTimeStep;
    } else {
        deltaSediment = uDepositionRate * sedimentDiff; // sedimentDiff is negative here
        // Clamp deposition to not exceed available sediment
        deltaSediment = max(deltaSediment, -sediment);
    }

    float orgSediment = sediment;
    sediment = sediment + deltaSediment;

    // --- 2. Water Update (Evaporation) ---

    // Water reduction due to evaporation
    // water = max(0.0, water - uEvaporationRate * uTimeStep); 
    water = water * .9;
    
    // Sediment scaling due to evaporation (less water means less carrying capacity)
    if (oldWater > 0.0) {
        sediment = sediment * (water / oldWater);
    }

     // --- 3. Boundary, Dryness Check, and Reset ---
    
    float minBound = -uMapSize;
    float maxBound = uMapSize;

    bool isDry = (water < k_minVolume);
    bool isOutOfBounds = (
        newPos.x < minBound || newPos.x > maxBound ||
        newPos.y < minBound || newPos.y > maxBound
    );

    if (isOutOfBounds || isDry) {
        newPos = randomPosition(vTextureCoord + pos);
        water = k_initialWater; 
        sediment = 0.0;        
        newDir = vec2(0.0, 0.0);
    }


    // --- 4. Write New State ---

    // Output 0 (New Position/Water Map)
    oColor0 = vec4(newPos, water, 1.0); 

    // Output 1 (New Velocity/Sediment Map)
    oColor1 = vec4(newDir, sediment, 1.0);

    // Output 2 (Debugging Map)
    oColor2 = vec4(gradient, sediment - orgSediment, 1.0);
}