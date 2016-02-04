// shadow.frag

precision highp float;
varying vec2 vTextureCoord;
varying vec4 vPosition;
varying vec4 vShadowCoord;

uniform vec3 color;
uniform sampler2D textureDepth;

void main(void) {
	
	vec4 ShadowCoord	= vShadowCoord / vShadowCoord.w;
	vec4 Shadow		= vec4(1.0);

	if ( ShadowCoord.z > -1.0 && ShadowCoord.z < 1.0 ) {
		Shadow = texture2DProj( textureDepth, ShadowCoord, -0.00005 );		
	}

	float bias = .0001;
	float visibility = 1.0;
	float descrease = .1;

	if ( texture2D( textureDepth, ShadowCoord.xy + vec2( -0.94201624, -0.39906216 )/700.0 ).z  <  ShadowCoord.z-bias ){		visibility-=descrease;}
	if ( texture2D( textureDepth, ShadowCoord.xy + vec2( 0.94558609, -0.768907256 )/700.0 ).z  <  ShadowCoord.z-bias ){		visibility-=descrease;}
	if ( texture2D( textureDepth, ShadowCoord.xy + vec2( -0.094184101, -0.92938870 )/700.0 ).z  <  ShadowCoord.z-bias ){	visibility-=descrease;}
	if ( texture2D( textureDepth, ShadowCoord.xy + vec2( 0.34495938, 0.29387760 )/700.0 ).z  <  ShadowCoord.z-bias ){		visibility-=descrease;}

	gl_FragColor = vec4( color, 1.0) * Shadow;

/*
	float bias = 0.005*tan(acos(NdotL)); // cosTheta is dot( n,l ), clamped between 0 and 1
	bias = clamp(bias, 0.0, 0.01);
	float visibility = 1.0;
	if ( texture2D( textureDepth, ShadowCoord.xy ).z  <  ShadowCoord.z-bias){
		visibility = 0.5;
	}

    gl_FragColor = vec4(( Diffuse * visibility + Ambient ) * color, 1.0);
*/  
}