// post.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D texture;
uniform sampler2D textureNormal;
uniform sampler2D textureLight;
uniform float time;

const float maxBrightness = length(vec3(1.0));
const float PI = 3.141592657;
const float TwoPI = 3.141592657 * 2.0;

vec2 envMapEquirect(vec3 wcNormal, float flipEnvMap) {
  float phi = acos(-wcNormal.y);
  float theta = atan(flipEnvMap * wcNormal.x, wcNormal.z) + PI;
  return vec2(theta / TwoPI, phi / PI);
}

vec2 envMapEquirect(vec3 wcNormal) {
    return envMapEquirect(wcNormal, -1.0);
}

void main(void) {
    
    vec3 N = texture2D(textureNormal, vTextureCoord).rgb * 2.0 - 1.0;
    vec4 colorRender = texture2D(texture, vTextureCoord+N.xy * .03);
    vec2 uv = envMapEquirect(N);
    vec3 envLight = texture2D(textureLight, uv).rgb;


    float R = .01;
    float S = 20.0;

    float brightness = length(colorRender.rgb) / maxBrightness - .5;
    float timeScale = cos(time*1.843956784) * .5 + 1.5;
    float t = fract(vTextureCoord.y * S + brightness * 2.0);
    t = smoothstep(.25-R, .25+R, abs(t-.5)) * .5;

    vec3 color = vec3(t);
    color += envLight;

    colorRender.rgb += envLight;

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = colorRender;
}