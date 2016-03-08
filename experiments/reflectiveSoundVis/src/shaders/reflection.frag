// reflection.frag

#define SHADER_NAME SIMPLE_TEXTURE

precision highp float;
uniform samplerCube texture;
uniform sampler2D textureLight;
uniform mat3 uNormalMatrix;

uniform vec3 axis;
uniform float angle;
uniform float showWires;

varying vec2 vTextureCoord;
varying vec3 vNormalWorldSpace;
varying vec3 vEyeDirWorldSpace;

const float PI = 3.141592657;
const float TwoPI = PI * 2.0;

float diffuse(vec3 N, vec3 L) {
	return max(dot(N, normalize(L)), 0.0);
}

vec2 envMapEquirect(vec3 wcNormal, float flipEnvMap) {
  float phi = acos(-wcNormal.y);
  float theta = atan(flipEnvMap * wcNormal.x, wcNormal.z) + PI;
  return vec2(theta / TwoPI, phi / PI);
}

vec2 envMapEquirect(vec3 wcNormal) {
    return envMapEquirect(wcNormal, -1.0);
}

const vec3 light = vec3(1.0);

vec4 quat_from_axis_angle(vec3 axis, float angle) { 
  vec4 qr;
  float half_angle = (angle * 0.5) * 3.14159 / 180.0;
  qr.x = axis.x * sin(half_angle);
  qr.y = axis.y * sin(half_angle);
  qr.z = axis.z * sin(half_angle);
  qr.w = cos(half_angle);
  return qr;
}

vec3 rotate_vertex_position(vec3 position, vec3 axis, float angle) { 
  vec4 q = quat_from_axis_angle(axis, angle);
  vec3 v = position.xyz;
  return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

void main(void) {
    vec3 vN = rotate_vertex_position(vNormalWorldSpace, axis, angle);
    // vec3 reflectedEyeWorldSpace = reflect( eye, normalize(vNormalWorldSpace) );
    vec3 reflectedEyeWorldSpace = reflect( vEyeDirWorldSpace, normalize(vN) );
    // reflectedEyeWorldSpace      = rotate_vertex_position(vEyeDirWorldSpace, axis, angle);
    
    vec3 N                      = uNormalMatrix*vNormalWorldSpace;
    float _diffuse              = diffuse(N, light);
    _diffuse                    = mix(_diffuse, 1.0, .2);
    gl_FragColor                = textureCube(texture, reflectedEyeWorldSpace);
    gl_FragColor.rgb            *= _diffuse;
    
    
    vec2 envLightUV             = envMapEquirect(vNormalWorldSpace);
    vec3 envLight               = texture2D(textureLight, envLightUV).rgb;
    gl_FragColor.rgb            += envLight;

    if(showWires > 0.0) {
      gl_FragColor = vec4(1.0);
    }
}