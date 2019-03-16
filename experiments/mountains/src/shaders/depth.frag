// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

vec2 PackDepth16( in float depth )
{
    float depthVal = depth * (256.0*256.0 - 1.0) / (256.0*256.0);
    vec3 encode = fract( depthVal * vec3(1.0, 256.0, 256.0*256.0) );
    return encode.xy - encode.yz / 256.0 + 1.0/512.0;
}


vec3 PackDepth24( in float depth )
{
    float depthVal = depth * (256.0*256.0*256.0 - 1.0) / (256.0*256.0*256.0);
    vec4 encode = fract( depthVal * vec4(1.0, 256.0, 256.0*256.0, 256.0*256.0*256.0) );
    return encode.xyz - encode.yzw / 256.0 + 1.0/512.0;
}

void main(void) {
	// vec4 bitShift      = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
	// const vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
	// vec4 rgbaDepth     = fract(gl_FragCoord.z * bitShift);
	// rgbaDepth          -= rgbaDepth.gbaa * bitMask;
	// gl_FragColor       = rgbaDepth;

	vec3 depth = PackDepth24(gl_FragCoord.z);
	gl_FragColor = vec4(depth, 1.0);
}