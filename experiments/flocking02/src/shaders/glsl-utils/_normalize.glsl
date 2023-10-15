vec2 _normalize(vec2 v) {
  if(length(v) <= 0.0) {
    return vec2(0.0);
  } else {
    return normalize(v);
  }
}

vec3 _normalize(vec3 v) {
  if(length(v) <= 0.0) {
    return vec3(0.0);
  } else {
    return normalize(v);
  }
}

#pragma glslify: export(_normalize)