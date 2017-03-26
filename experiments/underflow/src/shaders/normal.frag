// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;

const vec2 size = vec2(0.5,0.0);
const vec3 off = vec3(-1.0,0.0,1.0);

vec4 textureOffset(sampler2D t, vec2 uv, vec2 offset) {
	return texture2D(t, uv + offset * 0.1);
}

void main(void) {
	vec4 wave = texture2D(texture, vTextureCoord);
	float s11 = wave.x;
	float s01 = textureOffset(texture, vTextureCoord, off.xy).x;
	float s21 = textureOffset(texture, vTextureCoord, off.zy).x;
	float s10 = textureOffset(texture, vTextureCoord, off.yx).x;
	float s12 = textureOffset(texture, vTextureCoord, off.yz).x;
	vec3 va = normalize(vec3(size.xy,s21-s01));
	vec3 vb = normalize(vec3(size.yx,s12-s10));
	vec4 bump = vec4( cross(va,vb), s11 );

    gl_FragColor = vec4(bump.rgb, 1.0);
}