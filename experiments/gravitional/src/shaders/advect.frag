precision highp float;
precision mediump sampler2D;

varying vec2 vTextureCoord;
uniform float timestep;
uniform float dissipation;
uniform vec2 texelSize;      // 1 / grid scale 
uniform sampler2D velocity;  // input velocity
uniform sampler2D x;         // quantity to advect

void main() {
	vec2 tSize = texelSize;
	vec2 pos = vTextureCoord - timestep * tSize * texture2D(velocity, vTextureCoord).xy;

	gl_FragColor = dissipation * texture2D(x, pos);
}