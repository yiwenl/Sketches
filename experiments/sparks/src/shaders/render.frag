precision highp float;
varying vec4 vColor;
varying vec3 vExtra;
varying vec2 vUV;
uniform sampler2D textureParticle;


const float num = 8.0;

void main(void) {
	// if(distance(gl_PointCoord, vec2(.5)) > .5) discard;
    // gl_FragColor = vColor;

    vec2 uv = gl_PointCoord / num;
    uv += vUV;


    vec4 color = texture2D(textureParticle, uv);
    if(color.a <= 0.01) {
    	discard;
    }

    gl_FragColor = vColor * color;
}