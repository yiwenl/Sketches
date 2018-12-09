// copy.frag

#define NVERTS ${NUM}


precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vNoise;

uniform mat4 uViewMatrix;
uniform vec3 lightColor;
uniform float lightIntensity;
uniform vec3 lightverts[ NVERTS ];	// in local space
uniform mat4 lightMatrixWorld;

void main(void) {
    vec3 normal = normalize( vNormal );

	vec4 lPosition[ NVERTS ];

	vec3 lVector[ NVERTS ];

	// stub in some ambient reflectance
	vec3 color = vec3(1.0);

	vec3 ambient = color * vec3( 0.0 );

	// direction vectors from point to area light corners

	for( int i = 0; i < NVERTS; i ++ ) {

		lPosition[ i ] = uViewMatrix * lightMatrixWorld * vec4( lightverts[ i ], 1.0 ); // in camera space

		lVector[ i ] = normalize( lPosition[ i ].xyz + vViewPosition.xyz ); // dir from vertex to areaLight

	}

	// bail if the point is on the wrong side of the light... there must be a better way...

	float tmp = dot( lVector[ 0 ], cross( ( lPosition[ 0 ] - lPosition[ 1 ] ).xyz, ( lPosition[ 0 ] - lPosition[ 2 ] ).xyz ) );

	if ( tmp > 0.0 ) {

		gl_FragColor = vec4( ambient, 1.0 );
		return;

	}

	// vector irradiance at point

	vec3 lightVec = vec3( 0.0 );

	for( int i = 0; i < NVERTS; i ++ ) {

		vec3 v0 = lVector[ i ];
		vec3 v1 = lVector[ int( mod( float( i + 1 ), float( NVERTS ) ) ) ]; // ugh...

		lightVec += acos( dot( v1, v0 ) ) * normalize( cross( v1, v0 ) );

	}

	// irradiance factor at point

	float factor = max( dot( lightVec, normal ), 0.0 ) / ( 2.0 * 3.14159265 );

	// frag color

	vec3 diffuse = color * lightColor * lightIntensity * factor;

	gl_FragColor = vec4( ambient + diffuse, 1.0 );
	// gl_FragColor = vec4( vec3(vNoise), 1.0 );
}