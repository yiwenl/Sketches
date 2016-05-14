// addvel.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texturePos;
uniform sampler2D textureVel;
uniform sampler2D textureLife;
uniform sampler2D textureInit;
uniform float flyThreshold;

void main(void) {
	vec3 pos = texture2D(texturePos, vTextureCoord).rgb;
	vec3 init = texture2D(textureInit, vTextureCoord).rgb;
	vec3 vel = texture2D(textureVel, vTextureCoord).rgb;
	vec3 life = texture2D(textureLife, vTextureCoord).rgb;

    gl_FragColor = vec4(pos + vel, 1.0);
    if(life.r < flyThreshold) {
    	gl_FragColor = vec4(init, 1.0);
    }
}