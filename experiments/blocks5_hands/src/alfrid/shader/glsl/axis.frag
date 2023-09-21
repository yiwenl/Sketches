precision highp float;
varying vec3 vColor;
uniform float uOpacity;

void main(void) {
    gl_FragColor = vec4(vColor, uOpacity);
}