// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform vec3 defaultColor;
uniform float defaultOpacity;
uniform float luminosityThreshold;
uniform float smoothWidth;


void main(void) {

	vec4 texel       = texture2D( texture, vTextureCoord );
	
	vec3 luma        = vec3( 0.299, 0.587, 0.114 );
	float v          = dot( texel.xyz, luma );
	vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );
	float alpha      = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

	gl_FragColor = mix( outputColor, texel, alpha );
}