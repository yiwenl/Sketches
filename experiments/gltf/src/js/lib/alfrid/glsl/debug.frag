// debug.frag

#define SHADER_NAME debug_frag
#extension GL_EXT_shader_texture_lod: enable
#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform vec3 uEmissiveFactor;

#ifdef HAS_BASECOLORMAP
uniform sampler2D uColorMap;
#endif

#ifdef HAS_NORMALMAP
uniform sampler2D uNormalMap;
uniform float uNormalScale;
#endif

#ifdef HAS_OCCLUSIONMAP
uniform sampler2D uAoMap;
uniform float uOcclusionStrength;
#endif

varying vec2 vTextureCoord;
varying vec3 vNormal;
varying vec3 vPosition;

vec3 getNormal() {
	vec3 pos_dx = dFdx(vPosition);
	vec3 pos_dy = dFdy(vPosition);
	vec3 tex_dx = dFdx(vec3(vTextureCoord, 0.0));
	vec3 tex_dy = dFdy(vec3(vTextureCoord, 0.0));
	vec3 t = (tex_dy.t * pos_dx - tex_dx.t * pos_dy) / (tex_dx.s * tex_dy.t - tex_dy.s * tex_dx.t);

	vec3 ng = normalize(vNormal);

	t = normalize(t - ng * dot(ng, t));
	vec3 b = normalize(cross(ng, t));
	mat3 tbn = mat3(t, b, ng);

#ifdef HAS_NORMALMAP
	vec3 n = texture2D(uNormalMap, vTextureCoord).rgb;
	n = normalize(tbn * ((2.0 * n - 1.0) * vec3(uNormalScale, uNormalScale, 1.0)));
#else
	// The tbn matrix is linearly interpolated, so we need to re-normalize
	vec3 n = normalize(tbn[2].xyz);
#endif

	return n;
}


void main(void) {
    // gl_FragColor = vec4(vNormal * .5 + .5, 1.0);

    vec3 color = getNormal() * .5 + .5;

#ifdef HAS_BASECOLORMAP
	color = texture2D(uColorMap, vTextureCoord).rgb;
#endif

#ifdef HAS_OCCLUSIONMAP	
	float ao            = texture2D(uAoMap, vTextureCoord).r;
	color               = mix(color, color * ao, uOcclusionStrength);
#endif	

    gl_FragColor = vec4(color, 1.0);
}