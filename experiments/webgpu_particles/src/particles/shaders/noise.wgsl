// --- Simplex Noise Implementation (3D) ---
// Based on typical GLSL implementations (e.g. Ashima/Webgl-noise)

fn permute4(x: vec4<f32>) -> vec4<f32> { return ((x * 34.0 + 1.0) * x) % 289.0; }
fn taylorInvSqrt4(r: vec4<f32>) -> vec4<f32> { return 1.79284291400159 - 0.85373472095314 * r; }

fn snoise(v: vec3<f32>) -> f32 {
  const C = vec2<f32>(1.0 / 6.0, 1.0 / 3.0);
  const D = vec4<f32>(0.0, 0.5, 1.0, 2.0);

  // First corner
  var i  = floor(v + dot(v, C.yyy));
  var x0 = v - i + dot(i, C.xxx);

  // Other corners
  var g = step(x0.yzx, x0.xyz);
  var l = 1.0 - g;
  var i1 = min(g.xyz, l.zxy);
  var i2 = max(g.xyz, l.zxy);

  // x0 = x0 - 0.0 + 0.0 * C.xxx;
  // x1 = x0 - i1  + 1.0 * C.xxx;
  // x2 = x0 - i2  + 2.0 * C.xxx;
  // x3 = x0 - 1.0 + 3.0 * C.xxx;
  var x1 = x0 - i1 + C.xxx;
  var x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  var x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = i % 289.0;
  var p = permute4(permute4(permute4(
      i.z + vec4<f32>(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4<f32>(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4<f32>(0.0, i1.x, i2.x, 1.0));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  var n_ = 0.142857142857; // 1.0/7.0
  var ns = n_ * D.wyz - D.xzx;

  var j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  var x_ = floor(j * ns.z);
  var y_ = floor(j - 7.0 * x_);    // mod(j,N)

  var x = x_ * ns.x + ns.yyyy;
  var y = y_ * ns.x + ns.yyyy;
  var h = 1.0 - abs(x) - abs(y);

  var b0 = vec4<f32>(x.xy, y.xy);
  var b1 = vec4<f32>(x.zw, y.zw);

  // vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  // vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  var s0 = floor(b0) * 2.0 + 1.0;
  var s1 = floor(b1) * 2.0 + 1.0;
  var sh = -step(h, vec4<f32>(0.0));

  var a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  var a1 = b1.xzyw + s1.xzyw * sh.zzww;

  var p0 = vec3<f32>(a0.xy, h.x);
  var p1 = vec3<f32>(a0.zw, h.y);
  var p2 = vec3<f32>(a1.xy, h.z);
  var p3 = vec3<f32>(a1.zw, h.w);

  // Normalise gradients
  var norm = taylorInvSqrt4(vec4<f32>(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 = p0 * norm.x;
  p1 = p1 * norm.y;
  p2 = p2 * norm.z;
  p3 = p3 * norm.w;

  // Mix final noise value
  var m = max(0.6 - vec4<f32>(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), vec4<f32>(0.0));
  m = m * m;
  return 42.0 * dot(m * m, vec4<f32>(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// --- Curl Noise ---
// Curl(F) = (dFz/dy - dFy/dz, dFx/dz - dFz/dx, dFy/dx - dFx/dy)
// We use 3 calls to snoise to fake a vector field potential, then approximate derivatives.

fn curlNoise(p: vec3<f32>) -> vec3<f32> {
  const e = 0.1;
  let dx = vec3<f32>(e, 0.0, 0.0);
  let dy = vec3<f32>(0.0, e, 0.0);
  let dz = vec3<f32>(0.0, 0.0, e);

  // We need 3 independent noise fields: N1, N2, N3
  // Use large offsets to separate them in noise space
  let offset1 = vec3<f32>(123.4, 567.8, 901.2);
  let offset2 = vec3<f32>(901.2, 567.8, 123.4);

  // Calculate gradients for N1, N2, N3
  // We need derivatives:
  // dN1/dy, dN1/dz
  // dN2/dx, dN2/dz
  // dN3/dx, dN3/dy

  // 1. N1 (Potential X component) -> we need dN1/dy and dN1/dz
  // Just approximate simple differences
  let n1_y0 = snoise(p - dy); let n1_y1 = snoise(p + dy);
  let n1_z0 = snoise(p - dz); let n1_z1 = snoise(p + dz);
  let dN1_dy = (n1_y1 - n1_y0); // / (2*e) done at end
  let dN1_dz = (n1_z1 - n1_z0);

  // 2. N2 (Potential Y component) -> we need dN2/dx and dN2/dz
  let p2 = p + offset1;
  let n2_x0 = snoise(p2 - dx); let n2_x1 = snoise(p2 + dx);
  let n2_z0 = snoise(p2 - dz); let n2_z1 = snoise(p2 + dz);
  let dN2_dx = (n2_x1 - n2_x0);
  let dN2_dz = (n2_z1 - n2_z0);

  // 3. N3 (Potential Z component) -> we need dN3/dx and dN3/dy
  let p3 = p + offset2;
  let n3_x0 = snoise(p3 - dx); let n3_x1 = snoise(p3 + dx);
  let n3_y0 = snoise(p3 - dy); let n3_y1 = snoise(p3 + dy);
  let dN3_dx = (n3_x1 - n3_x0);
  let dN3_dy = (n3_y1 - n3_y0);

  // Curl = (dN3/dy - dN2/dz, dN1/dz - dN3/dx, dN2/dx - dN1/dy)
  let x = dN3_dy - dN2_dz;
  let y = dN1_dz - dN3_dx;
  let z = dN2_dx - dN1_dy;

  const divisor = 1.0 / (2.0 * e);
  return normalize(vec3<f32>(x, y, z) * divisor);
}
