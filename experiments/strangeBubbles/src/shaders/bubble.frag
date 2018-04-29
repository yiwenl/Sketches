// copy.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
varying vec2 vTextureCoord;
varying vec3 vNormal;
uniform sampler2D textureBg;
uniform sampler2D textureReflection;
uniform vec2 uDimension;
uniform vec3 uLookDir;


const float PI = 3.141592653;
const float TwoPI = PI * 2.0;

vec2 envMapEquirect(vec3 wcNormal, float flipEnvMap) {
  float phi = acos(-wcNormal.y);
  float theta = atan(flipEnvMap * wcNormal.x, wcNormal.z) + PI;
  return vec2(theta / TwoPI, phi / PI);
}

vec2 envMapEquirect(vec3 wcNormal) {
    return envMapEquirect(wcNormal, -1.0);
}


void main(void) {
	float d = dot(uLookDir, vNormal);

	d = smoothstep(1.0, 0.0, d);
	vec2 uvScreen = gl_FragCoord.xy/uDimension;
	vec3 color = texture2D(textureBg, uvScreen + (abs(vTextureCoord - 0.5)) * 0.1 * d).rgb;

	vec2 uvReflect = envMapEquirect(vNormal);
	vec3 colorReflection = texture2D(textureReflection, uvReflect).rgb;

	color += (colorReflection * 0.85 + d * 0.2) * pow(d + 0.2, 2.0);


    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(colorReflection, 1.0);
}