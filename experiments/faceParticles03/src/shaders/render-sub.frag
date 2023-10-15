// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vColor;


void main(void) {
    float d = distance(gl_PointCoord, vec2(0.5));
    d = smoothstep(0.5, 0.0, d);
    d = pow(d, 2.0);
    gl_FragColor = vec4(vColor, 1.0) * d * 2.0;
}