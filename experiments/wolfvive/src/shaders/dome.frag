// dome.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;

uniform sampler2D textureCurr;
uniform sampler2D textureNext;
uniform float uWaveLength;
uniform float uWaveFront;

varying vec2 vTextureCoord;
varying vec3 vPosition;
varying vec3 vWaveCenter;


void main(void) {
	vec3 colorCurr = texture2D(textureCurr, vTextureCoord).rgb;
	vec3 colorNext = texture2D(textureNext, vTextureCoord).rgb;

	float distToCenter = distance(vPosition, vWaveCenter);
	float distToWave = distance(distToCenter, uWaveFront);

	float scale 		= smoothstep(0.0, uWaveLength, distToWave);
	float offset 		= 0.0;
	if(distToCenter < uWaveFront) {
		offset = 1.0;
	} else {
		offset = 1.0 - scale;
	}
	float front 		= 1.0 - scale;

	vec3 color 			= mix(colorCurr, colorNext, offset);
	color.rgb 			*= front * 1.15 + 1.0;
	
    gl_FragColor 		= vec4(color, 1.0);
}