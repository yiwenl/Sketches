float quadraticOut(float t) {
  return -t * (t - 2.0);
}

#pragma glslify: export(quadraticOut)
