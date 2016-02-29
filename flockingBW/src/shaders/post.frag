// post.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureBlur;
uniform float focus;


float map(float value, float tx, float ty, float sx, float sy) {
	float p = (value - tx) / (ty - tx);
	return sx + (sy - sx) * p;
}

void main(void) {
    // gl_FragColor = texture2D(texture, vTextureCoord);
    vec3 colorDepth = texture2D(texture, vTextureCoord).rgb;
    vec3 colorBlur = texture2D(textureBlur, vTextureCoord).rgb;


    float offset;
    if(colorDepth.r < focus) {
    	offset = map(colorDepth.r, 0.0, focus, 0.0, 1.0);
    } else {
    	offset = map(colorDepth.r, focus, 1.0, 1.0, 0.0);
    }


    offset = pow(offset, 2.0);
    offset = smoothstep(0.0, 1.0, offset);

    gl_FragColor = vec4(mix(colorBlur, colorDepth, offset), 1.0);
    // gl_FragColor = vec4(vec3(offset), 1.0);

    // gl_FragColor = texture2D(texture, vTextureCoord);
}