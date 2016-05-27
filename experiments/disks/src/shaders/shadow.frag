// shadow.frag

// pbr.frag

#extension GL_EXT_shader_texture_lod : enable

precision highp float;

uniform sampler2D 	uAoMap;
uniform sampler2D 	uShadowMap;
uniform samplerCube uRadianceMap;
uniform samplerCube uIrradianceMap;

uniform vec3		uBaseColor;
uniform float		uRoughness;
uniform float		uRoughness4;
uniform float		uMetallic;
uniform float		uSpecular;

uniform float		uExposure;
uniform float		uGamma;

uniform float		uShadowStrength;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vWsPosition;
varying vec3 vEyePosition;
varying vec3 vWsNormal;
varying vec4 vShadowCoord;
varying vec2 vTextureCoord;

#define saturate(x) clamp(x, 0.0, 1.0)
#define PI 3.1415926535897932384626433832795


void main() {
	// output the fragment color
    gl_FragColor		= vec4( vec3(.5), 1.0 );

}