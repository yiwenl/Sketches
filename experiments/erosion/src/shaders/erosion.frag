#version 300 es

precision highp float;
in vec2 vTextureCoord;

uniform sampler2D uPosMap;
uniform sampler2D uDataMap;
uniform sampler2D uHeightMap;

uniform float uNumDrops;

out vec4 oColor;
#define SLOPE_THRESHOLD 0.1

void main(void) {
    int num = int(uNumDrops);
    vec2 uv;
    vec3 pos;
    vec3 data;
    float d;

    float threshold = 0.005;

    float h = texture(uHeightMap, vTextureCoord).x;

    for(int j=0; j<num; j++) {
        for(int i=0; i<num; i++) {
            uv = vec2(float(i)/float(num), float(j)/float(num));
            pos = texture(uPosMap, uv).xyz;
            data = texture(uDataMap, uv).xyz;
            
            uv = pos.xz * .5 + .5;
            uv.y = 1.0 - uv.y;


            d = distance(vTextureCoord, uv); 

            if(data.y > SLOPE_THRESHOLD) {
                d = smoothstep(threshold, 0.0, d);
                d = pow(d, 1.5);
                d *= data.x * 3.0;

                h -= 0.0005 * d;
            } else {
                d = smoothstep(threshold * 2.0, 0.0, d);
                d *= data.x * 3.0;

                h += 0.00015 * d * data.z;
            }


            // if(data.y > 0.01) {
            //     h -= 0.0005 * d *;
            // } else {
            //     h += 0.00015 * d;
            // }
        }
    }

    oColor = vec4(vec3(h), 1.0);
}