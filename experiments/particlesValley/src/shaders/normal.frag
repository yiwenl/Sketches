// normal.frag
#define SHADER_NAME COMPUTE_NORMAL

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;


const float gap = 0.0001;
const float heightOffset = 0.01;

vec3 getPos(vec2 uv) {
	float y = texture2D(texture, uv).r * heightOffset;
	return vec3(uv.x, y, uv.y);
}

void main(void) {
	vec3 curr = getPos(vTextureCoord);
	vec3 right = getPos(vTextureCoord + vec2(gap, 0.0));
	vec3 bottom = getPos(vTextureCoord + vec2(0.0, gap));
	vec3 vr = right - curr;
	vec3 vb = bottom - curr;
	vec3 N = normalize(cross(vb, vr));
    gl_FragColor = vec4(N, 1.0);
}