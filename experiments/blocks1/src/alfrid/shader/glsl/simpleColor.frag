precision highp float;

uniform vec3 uColor;
uniform float uOpacity;

void main(void) {
    gl_FragColor = vec4(uColor, uOpacity);
}