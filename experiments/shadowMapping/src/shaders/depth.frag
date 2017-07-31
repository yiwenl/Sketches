// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec3 vNormal;

void main(void) {
    // gl_FragColor = vec4(vNormal, 1.0);
    gl_FragColor = vec4(vec3(gl_FragCoord.z), 1.0);
}