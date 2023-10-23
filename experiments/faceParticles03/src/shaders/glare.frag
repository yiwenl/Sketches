// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform float uTime;

void main(void) {
    float d = distance(vTextureCoord, vec2(.5));
    d = smoothstep(0.5, 0.0, d);
    d = pow(d, 3.0);

    float t = sin(uTime * 0.2) * .5 + .5;
    d *= mix(0.1, 0.2, t);
    gl_FragColor = vec4(d);
    gl_FragColor.rgb *= vec3(1.0, .97, .92);
}