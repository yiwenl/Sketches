#version 300 es

precision highp float;
in vec3 vColor;
in vec4 vShadowCoord;
in float vInRegion;
uniform sampler2D uDepthMap;
uniform vec2 uShadowMapSize; // Size of the shadow map texture
uniform bool uUseShadow; // Whether to calculate shadows

out vec4 oColor;

// PCF (Percentage Closer Filtering) shadow calculation
float calculatePCFShadow(sampler2D depthMap, vec4 shadowCoord, float bias, int filterSize) {
    // Use textureProj for automatic perspective divide and proper coordinate handling
    // First, check if we're in the valid range
    vec3 projCoords = shadowCoord.xyz / shadowCoord.w;
    vec2 uv = projCoords.xy;
    
    // Check if the fragment is outside the shadow map
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
        return 1.0; // Not in shadow if outside the map
    }
    
    // Depth in [0,1] range (NDC after bias matrix)
    float currentDepth = projCoords.z; // Transform from [-1,1] to [0,1]
    float threshold = currentDepth - bias;
    float shadow = 0.0;
    
    // Calculate texel size for proper sampling
    vec2 texelSize = 1.0 / uShadowMapSize;
    
    // Sample multiple times around the current position
    int halfFilter = filterSize / 2;
    int sampleCount = 0;
    
    for (int x = -halfFilter; x <= halfFilter; x++) {
        for (int y = -halfFilter; y <= halfFilter; y++) {
            vec2 offset = vec2(float(x), float(y)) * texelSize;
            float closestDepth = texture(depthMap, uv + offset).r;
            
            // Compare: if current depth (with bias) is greater than stored depth, we're in shadow
            shadow += step(threshold, closestDepth);
            sampleCount++;
        }
    }
    
    // Average the results
    return shadow / float(sampleCount);
}

float pcfShadow( vec4 sc, sampler2D uDepthMap)
{
    const int s = 2;
    float shadow = 0.0;

    float bias = 0.005;
    float threshold = sc.z - bias;


    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2(-s,-s) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2(-s, 0) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2(-s, s) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2( 0,-s) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2( 0, 0) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2( 0, s) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2( s,-s) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2( s, 0) ).r);
    shadow += step(threshold, textureProjOffset( uDepthMap, sc, ivec2( s, s) ).r);
    return shadow/9.0;
}


void main(void) {
    if(distance(gl_PointCoord, vec2(0.5)) > 0.5) {
        discard;
    }

    vec3 finalColor = vColor;
    vec4 shadowCoord = vShadowCoord / vShadowCoord.w;
    
    // Only calculate shadows if enabled
    // if (uUseShadow || true) {
        // Shadow bias to prevent shadow acne
        float bias = 0.005;
        
        // Calculate PCF shadow (using 3x3 filter for soft shadows)
        // You can adjust the filter size: 1 = hard shadows, 3 = soft, 5 = very soft
        float shadow = calculatePCFShadow(uDepthMap, vShadowCoord, bias, 3);
        
        // Apply shadow to the color
    // }

    // shadow = pcfShadow(shadowCoord, uDepthMap);
    // vec3 color = mix(vColor, vec3(.9, 0.05, 0.0), vInRegion);

    vec3 color = vColor;
    color *= mix(vec3(1.0), vec3(.9, 0.05, 0.0), vInRegion);
    finalColor = color * mix(0.3, 1.0, shadow); // Darken shadowed areas


    
    oColor = vec4(finalColor, 1.0);
}