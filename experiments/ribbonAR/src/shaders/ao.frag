#version 300 es
precision highp float;

in vec2 vTextureCoord;
out vec4 oColor;

uniform sampler2D uDepthMap;
uniform vec2 uScreenSize;
uniform float uRadius;


#define uNear 6.0
#define uFar 15.0


const float PI = 3.141592657;

const int samples = 8; //samples on the first ring (4-8)
const int rings = 4; //ring count (3-6)


vec2 rand(in vec2 coord) //generating random noise
{
	float noiseX = (fract(sin(dot(coord ,vec2(12.9898,78.233))) * 43758.5453));
	float noiseY = (fract(sin(dot(coord ,vec2(12.9898,78.233)*2.0)) * 43758.5453));
	return vec2(noiseX,noiseY) * 0.001;
}

float readDepth(in vec2 coord)
{
	return (2.0 * uNear) / (uFar + uNear - texture(uDepthMap, coord ).x * (uFar-uNear));        
}


float compareDepths(in float depth1, in float depth2)
{
    float aoCap = 1.0;
    float aoMultiplier = 50.0;
    float depthTolerance = 0.000;
    float aorange = 50.0; // units in space the AO effect extends to (this gets divided by the camera far range)
    float maxDepthDifference = 0.05; // Threshold for depth difference

    // Calculate depth difference
    float depthDifference = abs(depth1 - depth2);

    // Check if the depth difference exceeds the threshold
    // if (depthDifference > maxDepthDifference) {
    //     return 0.0; // No AO if the difference is too large
    // }

    // Existing depth comparison logic
    float diff = sqrt(clamp(1.0 - (depth1 - depth2) / (aorange / (uFar - uNear)), 0.0, 1.0));
    float ao = min(aoCap, max(0.0, depth1 - depth2 - depthTolerance) * aoMultiplier) * diff;

    ao *= smoothstep(maxDepthDifference, maxDepthDifference * 0.5, depthDifference);

    return ao;
}


float checkSurroundingDepth(in vec2 coord, float baseDepth, float threshold) {
    float count = 0.0;
    float total = 0.0;
    float range = 0.02; // Range of pixels to check around the current pixel

    for (float x = -range; x <= range; x += 0.05) {
        for (float y = -range; y <= range; y += 0.05) {
            float depth = readDepth(coord + vec2(x, y));
            if (abs(depth - baseDepth) > threshold) {
                count += 1.0;
            }
            total += 1.0;
        }
    }

    // Return the ratio of nearby different-depth pixels to the total checked pixels
    return count / total;
}


float ssao() {
    float scale = uRadius;
    float textureWidth = uScreenSize.x * scale;
    float textureHeight = uScreenSize.y * scale;

	float depth = readDepth(vTextureCoord);
	float d;
	float aspect = textureWidth/textureHeight;
	vec2 noise = rand(vTextureCoord * 10.0);

	float w = (1.0 / textureWidth)/clamp(depth,0.05,1.0)+(noise.x*(1.0-noise.x));
    float h = (1.0 / textureHeight)/clamp(depth,0.05,1.0)+(noise.y*(1.0-noise.y));
   
    float pw = 0.0;
    float ph = 0.0;

    float ao = 0.0;       
    float s = 0.0;
    float fade = 4.0;
    float t = 1.0;


    for (int i = 0 ; i < rings; i += 1) {
    	fade *= 0.25;
        for (int j = 0 ; j < samples*rings; j += 1) {
        	if (j >= samples*i) break;
            float step = PI*2.0 / (float(samples)*float(i));
            pw = (cos(float(j)*step)*float(i)) * t;
            ph = (sin(float(j)*step)*float(i))*aspect * t;
            d = readDepth( vec2(vTextureCoord.s+pw*w,vTextureCoord.t+ph*h));
            ao += compareDepths(depth,d)*fade;     
            s += 1.0*fade;
        }
    }

    ao /= s;
    ao = 1.0 - ao;
    float offset = .5;
    ao = offset + (1.0 - offset) * ao;
    ao = pow(ao, 2.0);

	return ao;
}


void main() {
    float ao = ssao();
    oColor = vec4(ao, ao, ao, 1.0);
}
