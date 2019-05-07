precision highp float;
precision mediump sampler2D;

varying vec2 vTextureCoord;
uniform sampler2D pressure;
uniform float dissipation;

void main() {
    gl_FragColor = dissipation * texture2D(pressure, vTextureCoord);
}