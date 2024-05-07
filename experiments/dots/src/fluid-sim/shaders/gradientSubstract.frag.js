module.exports = `precision highp float;

varying vec2 vTextureCoord;
uniform vec2 uTexelSize;
uniform sampler2D texturePressure;
uniform sampler2D textureVel;

void main() {
	float pL     = texture2D(texturePressure, vTextureCoord - vec2(uTexelSize.x, 0.0)).x;
	float pR     = texture2D(texturePressure, vTextureCoord + vec2(uTexelSize.x, 0.0)).x;
	float pB     = texture2D(texturePressure, vTextureCoord - vec2(0.0, uTexelSize.y)).x;
	float pT     = texture2D(texturePressure, vTextureCoord + vec2(0.0, uTexelSize.y)).x;
	vec2 v       = texture2D(textureVel, vTextureCoord).xy;
	gl_FragColor = vec4(v - vec2(pR - pL, pT - pB), 0.0, 1.0);
}`;
