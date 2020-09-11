#extension GL_EXT_draw_buffers : require 

precision highp float;
varying vec3 vColor;
varying vec3 vNormal;

void main(void) {
    vec2 vel = normalize(vColor.xy) * 0.01;

    gl_FragData[0] = vec4(vColor, 1.0);
    gl_FragData[1] = vec4(vel, 0.0, 1.0);
    gl_FragData[2] = vec4(vNormal, 1.0);
    gl_FragData[3] = vec4(vNormal.x, 0.0, 0.0, 1.0);
    gl_FragData[4] = vec4(0.0, 0.0, 0.0, 1.0);
}