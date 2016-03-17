// normal.frag
precision highp float;

uniform sampler2D texture;
varying vec2 vTextureCoord;

const float SHIFT = .001;

float map(float value, float sx, float sy, float tx, float ty) {
	float p = (value - sx) / ( sy - sx);
	return tx + p * ( ty - tx);
}

void main(void) {
	// gl_FragColor = texture2D(texture, vTextureCoord);
	const float XZScale = 2.0;
	const float YSCale = 1.0;
	float gap = map(SHIFT, 0.0, 1.0, 0.0, 2.0);
	// float gap = SHIFT;

	vec3 pixelCurr  = vec3(vTextureCoord.x, texture2D(texture, vTextureCoord).r, vTextureCoord.y);
	vec3 pixelRight = vec3(vTextureCoord.x+gap, texture2D(texture, vTextureCoord+vec2(SHIFT, 0.0)).r, vTextureCoord.y);
	vec3 pixelUp    = vec3(vTextureCoord.x, texture2D(texture, vTextureCoord+vec2(0.0, SHIFT)).r, vTextureCoord.y+gap);

	pixelCurr  *= vec3(XZScale, YSCale, XZScale);
	pixelRight *= vec3(XZScale, YSCale, XZScale);
	pixelUp    *= vec3(XZScale, YSCale, XZScale);

	vec3 vRight = pixelRight - pixelCurr;
	vec3 vUp = pixelUp - pixelCurr;

	// vec3 normal = (normalize(cross(vRight, vUp)) + 1.0) * .5;
	vec3 normal = (normalize(cross(vUp, vRight)) + 1.0) * .5;

	gl_FragColor = vec4(normal, 1.0);
}