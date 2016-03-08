// blur.vert


precision highp float;
attribute vec2 aPosition;
uniform vec2 direction;
uniform float range;

varying vec2 vTextureCoord;
varying vec2 v_blurTexCoords[14];

void main(void) {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vTextureCoord = aPosition * .5 + .5;


    v_blurTexCoords[ 0] = vTextureCoord + vec2(-0.028, -0.028) * direction * range;
    v_blurTexCoords[ 1] = vTextureCoord + vec2(-0.024, -0.024) * direction * range;
    v_blurTexCoords[ 2] = vTextureCoord + vec2(-0.020, -0.020) * direction * range;
    v_blurTexCoords[ 3] = vTextureCoord + vec2(-0.016, -0.016) * direction * range;
    v_blurTexCoords[ 4] = vTextureCoord + vec2(-0.012, -0.012) * direction * range;
    v_blurTexCoords[ 5] = vTextureCoord + vec2(-0.008, -0.008) * direction * range;
    v_blurTexCoords[ 6] = vTextureCoord + vec2(-0.004, -0.004) * direction * range;
    v_blurTexCoords[ 7] = vTextureCoord + vec2( 0.004,  0.004) * direction * range;
    v_blurTexCoords[ 8] = vTextureCoord + vec2( 0.008,  0.008) * direction * range;
    v_blurTexCoords[ 9] = vTextureCoord + vec2( 0.012,  0.012) * direction * range;
    v_blurTexCoords[10] = vTextureCoord + vec2( 0.016,  0.016) * direction * range;
    v_blurTexCoords[11] = vTextureCoord + vec2( 0.020,  0.020) * direction * range;
    v_blurTexCoords[12] = vTextureCoord + vec2( 0.024,  0.024) * direction * range;
    v_blurTexCoords[13] = vTextureCoord + vec2( 0.028,  0.028) * direction * range;
}
