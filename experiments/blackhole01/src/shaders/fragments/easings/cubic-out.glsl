float cubicOut(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

#pragma glslify: export(cubicOut)
