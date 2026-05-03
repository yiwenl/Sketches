module.exports = `precision highp float;

varying vec2 vTextureCoord;
uniform float uTimestep;
uniform float uDissipation;
uniform vec2 uTexelSize;      // 1 / grid scale 
uniform sampler2D textureVel;  // input textureVel
uniform sampler2D textureMap;         // quantity to advect

void main() {
	vec2 pos = vTextureCoord - uTimestep * uTexelSize * texture2D(textureVel, vTextureCoord).xy;
	gl_FragColor = uDissipation * texture2D(textureMap, pos);
}`;
