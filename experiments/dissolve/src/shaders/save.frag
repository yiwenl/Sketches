// save.frag

#extension GL_EXT_draw_buffers : require 
precision highp float;

varying vec3 vColor;
varying vec3 vExtra;


//	1 : position
// 	2 : velocity
// 	3 : extras
//	4 : org position
// 	5 : {hasSet, random, random}

void main(void) {
    gl_FragData[0] = vec4(vColor, 1.0);
    gl_FragData[1] = vec4(0.0, 0.0, 0.0, 1.0);
    gl_FragData[2] = vec4(vExtra, 1.0);
    gl_FragData[3] = vec4(vColor, 1.0);
    gl_FragData[4] = vec4(0.0, 0.0, 0.0, 1.0);
}