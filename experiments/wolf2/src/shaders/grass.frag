//grass.frag


#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec2 vUV;
varying vec3 vPosition;
varying float vHeight;
varying vec3 vGrassNormal;
varying vec3 vColor;

uniform sampler2D texture;
uniform float uTerrainSize;
uniform vec2 uUVWolf;
uniform float uLightIntensity;

#define EDGE 2.0

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}


vec3 diffuse(vec3 N, vec3 L, vec3 C) {
	return diffuse(N, L) * C;
}

float contrast(float mValue, float mScale, float mMidPoint) {
	return clamp( (mValue - mMidPoint) * mScale + mMidPoint, 0.0, 1.0);
}

float contrast(float mValue, float mScale) {
	return contrast(mValue,  mScale, .5);
}

float getShadow(vec2 uv) {
	const float RANGE = 0.035;
	uv.y = contrast(uv.y, 0.5);
	float distWolf = distance(uv, uUVWolf);
	float shadowWolf = smoothstep(RANGE, 0.0, distWolf);
	return shadowWolf * 0.2;
}

void main(void) {

	float opacity 	= 1.0;
	float absz 		= abs(vPosition.z);
	opacity 		= smoothstep(uTerrainSize, uTerrainSize - EDGE, absz);
	
	vec4 color 		= texture2D(texture, vTextureCoord);
	color.a 		*= opacity;
	
	if(color.a < 0.75) discard;
	// color.rgb		*= vColor*1.4;

	float d 		= diffuse(vGrassNormal, vec3(1.0));
	d 				= mix(d, 1.0, .56);
	color.rgb 		*= d * uLightIntensity;

	float shadowWolf = getShadow(vUV);
	color -= shadowWolf;

    gl_FragColor 	= color;
    // gl_FragColor.rgb *= vHeight;
}