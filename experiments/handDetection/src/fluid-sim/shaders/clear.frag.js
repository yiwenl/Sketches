module.exports = `precision highp float;

varying vec2 vTextureCoord;
uniform sampler2D texturePressure;
uniform float uDissipation;

void main() {
    gl_FragColor = uDissipation * texture2D(texturePressure, vTextureCoord);
}`;
