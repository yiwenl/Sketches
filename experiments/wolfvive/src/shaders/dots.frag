// dots.frag


#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vPosition;
varying float vHeight;

uniform float uTerrainSize;

#define RANGE 5.1

void main(void) {
	float opacity = 1.0;
	float absz = abs(vPosition.z);
	opacity = smoothstep(uTerrainSize, uTerrainSize - RANGE, absz);
    gl_FragColor = vec4(vec3(1.0, vHeight*0.9+0.1, 0.0), opacity);
}