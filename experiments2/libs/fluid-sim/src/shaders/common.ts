export const COMMON_WGSL = /* wgsl */ `
fn mirrorRepeat01(t: f32) -> f32 {
  let mod2 = t % 2.0;
  let mod2pos = select(mod2 + 2.0, mod2, mod2 >= 0.0);
  return select(2.0 - mod2pos, mod2pos, mod2pos < 1.0);
}

fn mirrorRepeat2(c: vec2<f32>) -> vec2<f32> {
  return vec2(mirrorRepeat01(c.x), mirrorRepeat01(c.y));
}

fn sampleScalarMirrored(tex: texture_2d<f32>, uv: vec2<f32>, gridSize: f32) -> f32 {
  let m = mirrorRepeat2(uv);
  let gs = vec2<f32>(gridSize, gridSize);
  let coord = vec2<i32>(clamp(m * gs, vec2(0.0), gs - 1.0));
  return textureLoad(tex, coord, 0).x;
}

fn sampleVec2Mirrored(tex: texture_2d<f32>, uv: vec2<f32>, gridSize: f32) -> vec2<f32> {
  let m = mirrorRepeat2(uv);
  let gs = vec2<f32>(gridSize, gridSize);
  let coord = vec2<i32>(clamp(m * gs, vec2(0.0), gs - 1.0));
  return textureLoad(tex, coord, 0).xy;
}

fn sampleScalarOffset(tex: texture_2d<f32>, coord: vec2<i32>, gridSize: f32) -> f32 {
  let gs = i32(gridSize);
  let cx = select(select(coord.x, 2 * gs - 2 - coord.x, coord.x >= gs), -coord.x, coord.x < 0);
  let cy = select(select(coord.y, 2 * gs - 2 - coord.y, coord.y >= gs), -coord.y, coord.y < 0);
  return textureLoad(tex, vec2<i32>(cx, cy), 0).x;
}

fn sampleVec2Offset(tex: texture_2d<f32>, coord: vec2<i32>, gridSize: f32) -> vec2<f32> {
  let gs = i32(gridSize);
  let cx = select(select(coord.x, 2 * gs - 2 - coord.x, coord.x >= gs), -coord.x, coord.x < 0);
  let cy = select(select(coord.y, 2 * gs - 2 - coord.y, coord.y >= gs), -coord.y, coord.y < 0);
  return textureLoad(tex, vec2<i32>(cx, cy), 0).xy;
}

fn sampleVelocityMirrored(tex: texture_2d<f32>, uv: vec2<f32>, gridSize: f32) -> vec2<f32> {
  let m = mirrorRepeat2(uv);
  let mult = vec2<f32>(
    select(1.0, -1.0, uv.x < 0.0 || uv.x > 1.0),
    select(1.0, -1.0, uv.y < 0.0 || uv.y > 1.0)
  );
  let gs = vec2<f32>(gridSize, gridSize);
  let coord = vec2<i32>(clamp(m * gs, vec2(0.0), gs - 1.0));
  return textureLoad(tex, coord, 0).xy * mult;
}

fn sampleBilinear(tex: texture_2d<f32>, uv: vec2<f32>, gridSize: f32) -> vec4<f32> {
  let m = mirrorRepeat2(uv);
  let gs = vec2<f32>(gridSize, gridSize);
  let p = clamp(m * gs - 0.5, vec2(0.0), gs - 1.001);
  let t0 = floor(p);
  let f = p - t0;
  let t1 = t0 + 1.0;

  let i0 = vec2<i32>(t0);
  let i1 = vec2<i32>(t1);
  let maxC = vec2<i32>(i32(gridSize) - 1);

  let c0 = clamp(i0, vec2(0), maxC);
  let c1 = clamp(i1, vec2(0), maxC);

  let v00 = textureLoad(tex, vec2<i32>(c0.x, c0.y), 0);
  let v10 = textureLoad(tex, vec2<i32>(c1.x, c0.y), 0);
  let v01 = textureLoad(tex, vec2<i32>(c0.x, c1.y), 0);
  let v11 = textureLoad(tex, vec2<i32>(c1.x, c1.y), 0);

  let v0 = mix(v00, v10, f.x);
  let v1 = mix(v01, v11, f.x);

  return mix(v0, v1, f.y);
}

fn sampleScalarBilinear(tex: texture_2d<f32>, uv: vec2<f32>, gridSize: f32) -> f32 {
  return sampleBilinear(tex, uv, gridSize).x;
}
`;
