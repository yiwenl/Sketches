#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uHeightMap;
uniform sampler2D uErosionMap;

out vec4 oColor;

void main(void) {
    float height = texture(uHeightMap, vTextureCoord).r;
    float sediment = texture(uErosionMap, vTextureCoord).r;
    
    // Sample neighbor heights to find the minimum
    ivec2 texSize = textureSize(uHeightMap, 0);
    float delta = 2.0 / float(texSize.x);
    
    float h_l = texture(uHeightMap, vTextureCoord + vec2(-delta, 0.0)).r;
    float h_r = texture(uHeightMap, vTextureCoord + vec2( delta, 0.0)).r;
    float h_u = texture(uHeightMap, vTextureCoord + vec2( 0.0, -delta)).r;
    float h_d = texture(uHeightMap, vTextureCoord + vec2( 0.0,  delta)).r;
    
    // Find the minimum height among neighbors
    float minNeighborHeight = min(min(h_l, h_r), min(h_u, h_d));
    
    // The minimum possible height is the lower of: sea level (0.0) or the lowest neighbor
    // This prevents creating impossible valleys where a point is lower than all its neighbors
    float minPossibleHeight = max(0.0, minNeighborHeight);
    
    // Limit erosion so we don't erode below the minimum possible height
    float maxErosion = height - minPossibleHeight;
    sediment = min(sediment, maxErosion);
    
    height -= sediment;
    
    // Final safety check: limit to sea level
    height = max(height, 0.0);
    oColor = vec4(vec3(height), 1.0);
}