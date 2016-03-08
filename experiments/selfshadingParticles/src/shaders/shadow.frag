// shadow.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec4 vPosition;
varying vec4 vShadowCoord;
varying vec4 vColor;

uniform vec3 color;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform vec3 lightPosition;
uniform sampler2D textureDepth;
uniform float uShadowStrength;
uniform float uShadowThreshold;

float pcfSoftShadow(sampler2D shadowMap) {
	const float shadowMapSize  = 1024.0;
	const float shadowBias     = .00005;
	float shadow = 0.0;
	float texelSizeX =  1.0 / shadowMapSize;
	float texelSizeY =  1.0 / shadowMapSize;
	vec4 shadowCoord	= vShadowCoord / vShadowCoord.w;

	bvec4 inFrustumVec = bvec4 ( shadowCoord.x >= 0.0, shadowCoord.x <= 1.0, shadowCoord.y >= 0.0, shadowCoord.y <= 1.0 );
	bool inFrustum = all( inFrustumVec );

	bvec2 frustumTestVec = bvec2( inFrustum, shadowCoord.z <= 1.0 );

	bool frustumTest = all( frustumTestVec );
	

	if ( frustumTest ) {
		shadowCoord.z += shadowBias;
		float xPixelOffset = texelSizeX;
		float yPixelOffset = texelSizeY;

		float dx0 = - 1.0 * xPixelOffset;
		float dy0 = - 1.0 * yPixelOffset;
		float dx1 = 1.0 * xPixelOffset;
		float dy1 = 1.0 * yPixelOffset;

		mat3 shadowKernel;
		mat3 depthKernel;

		depthKernel[ 0 ][ 0 ] = texture2D( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ) ).r ;
		depthKernel[ 0 ][ 1 ] = texture2D( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ) ).r ;
		depthKernel[ 0 ][ 2 ] = texture2D( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ) ).r ;
		depthKernel[ 1 ][ 0 ] = texture2D( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ) ).r ;
		depthKernel[ 1 ][ 1 ] = texture2D( shadowMap, shadowCoord.xy ).r ;
		depthKernel[ 1 ][ 2 ] = texture2D( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ) ).r ;
		depthKernel[ 2 ][ 0 ] = texture2D( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ) ).r ;
		depthKernel[ 2 ][ 1 ] = texture2D( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ) ).r ;
		depthKernel[ 2 ][ 2 ] = texture2D( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ) ).r ;

		vec3 shadowZ = vec3( shadowCoord.z );
		shadowKernel[ 0 ] = vec3( lessThan( depthKernel[ 0 ], shadowZ ) );
		shadowKernel[ 0 ] *= vec3( 0.25 );

		shadowKernel[ 1 ] = vec3( lessThan( depthKernel[ 1 ], shadowZ ) );
		shadowKernel[ 1 ] *= vec3( 0.25 );

		shadowKernel[ 2 ] = vec3( lessThan( depthKernel[ 2 ], shadowZ ) );
		shadowKernel[ 2 ] *= vec3( 0.25 );

		vec2 fractionalCoord = 1.0 - fract( shadowCoord.xy * shadowMapSize );

		shadowKernel[ 0 ] = mix( shadowKernel[ 1 ], shadowKernel[ 0 ], fractionalCoord.x );
		shadowKernel[ 1 ] = mix( shadowKernel[ 2 ], shadowKernel[ 1 ], fractionalCoord.x );

		vec4 shadowValues;
		shadowValues.x = mix( shadowKernel[ 0 ][ 1 ], shadowKernel[ 0 ][ 0 ], fractionalCoord.y );
		shadowValues.y = mix( shadowKernel[ 0 ][ 2 ], shadowKernel[ 0 ][ 1 ], fractionalCoord.y );
		shadowValues.z = mix( shadowKernel[ 1 ][ 1 ], shadowKernel[ 1 ][ 0 ], fractionalCoord.y );
		shadowValues.w = mix( shadowKernel[ 1 ][ 2 ], shadowKernel[ 1 ][ 1 ], fractionalCoord.y );

		shadow = dot( shadowValues, vec4( 1.0 ) ) * uShadowStrength;

	}

	return shadow;
}


vec4 textureProjOffset(sampler2D uShadowMap, vec4 sc, vec2 offset) {
	const float shadowBias     = .00005;
	vec4 scCopy = sc;
	scCopy.xy += offset;
	return texture2DProj(uShadowMap, scCopy, shadowBias);
}

vec4 pcfShadow(sampler2D uShadowMap) {
	vec4 sc                   = vShadowCoord / vShadowCoord.w;
	const float shadowMapSize = 1024.0;
	const float s             = 1.0/shadowMapSize;
	vec4 shadow              = vec4(0.0);
	shadow += textureProjOffset( uShadowMap, sc, vec2(-s,-s) );
	shadow += textureProjOffset( uShadowMap, sc, vec2(-s, 0) );
	shadow += textureProjOffset( uShadowMap, sc, vec2(-s, s) );
	shadow += textureProjOffset( uShadowMap, sc, vec2( 0,-s) );
	shadow += textureProjOffset( uShadowMap, sc, vec2( 0, 0) );
	shadow += textureProjOffset( uShadowMap, sc, vec2( 0, s) );
	shadow += textureProjOffset( uShadowMap, sc, vec2( s,-s) );
	shadow += textureProjOffset( uShadowMap, sc, vec2( s, 0) );
	shadow += textureProjOffset( uShadowMap, sc, vec2( s, s) );
	return shadow/9.0;
}


void main(void) {
	if(vColor.a <= 0.0) discard;
	float pcf    = pcfSoftShadow(textureDepth);
	pcf = 1.0 - smoothstep(0.0, uShadowThreshold, pcf);


	// float pcf = pcfShadow(textureDepth).r;
	// pcf = 1.0 - smoothstep(0.0, uShadowThreshold, pcf);
	// pcf = smoothstep(1.0, .9, pcf);
	
	vec4 color   = vColor;
	color.rgb *= pcf;
	gl_FragColor = color;

}