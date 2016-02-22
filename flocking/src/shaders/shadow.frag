// shadow.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec4 vShadowCoord;
varying vec3 vVertex;
varying vec3 vExtra;

uniform vec3 lightPosition;
uniform sampler2D textureDepth;
uniform float uShadowStrength;
uniform float uShadowThreshold;
uniform mat3 uNormalMatrix;


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


float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), .0);
}


void main(void) {
	// float pcf    = pcfSoftShadow(textureDepth);
	// pcf = 1.0 - smoothstep(0.0, uShadowThreshold, pcf);

	/*
	vec4 color   = vec4(1.0);
	color.rgb *= pcf;
	gl_FragColor = color;
	*/

	vec3 N = uNormalMatrix * normalize(vVertex + vExtra);
	float _diffuse = diffuse(N, lightPosition);
	_diffuse = mix(_diffuse, 1.0, 0.13);

    gl_FragColor = vec4(vec3(_diffuse), 1.0);
}