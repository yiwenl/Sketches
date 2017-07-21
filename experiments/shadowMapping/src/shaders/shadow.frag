// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec2 vScreenCoord;
varying vec3 vNormal;
varying vec4 vShadowCoord;
uniform sampler2D textureDepth;

float pcfSoftShadow(sampler2D shadowMap) {
	const float shadowMapSize  = 1024.0;
	const float shadowBias     = .0001;
	float shadow = 0.0;
	float texelSizeX =  1.0 / shadowMapSize;
	float texelSizeY =  1.0 / shadowMapSize;
	vec4 shadowCoord	= vShadowCoord / vShadowCoord.w;

	float visibility = 1.0;
	if ( texture2D( textureDepth, vShadowCoord.xy ).r  <  vShadowCoord.z - shadowBias){
	    visibility = 0.5;
	}

	return visibility;
}

void main(void) {
	float pcf    = pcfSoftShadow(textureDepth);

	float d = texture2D( textureDepth, vShadowCoord.xy ).r;

    gl_FragColor = vec4(vec3(pcf), 1.0);
    gl_FragColor = vec4(vShadowCoord.rg/vShadowCoord.w, 0.0, 1.0);
    // gl_FragColor = vec4(vec3(d), 1.0);

    // gl_FragColor = texture2D(textureDepth, vScreenCoord);
}