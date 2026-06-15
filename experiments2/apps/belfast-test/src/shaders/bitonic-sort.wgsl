// Sort pass 2: a single bitonic compare-exchange step.
//
// The host dispatches this once per (k, j) step of the bitonic schedule. Each
// invocation owns element `i` and conditionally swaps with partner `i ^ j`. We
// sort DESCENDING by dist (farthest first) so the draw pass renders back-to-
// front for correct alpha blending.

struct Key {
  dist: f32,
  index: u32,
}

struct SortParams {
  j: u32,     // compare distance for this step
  k: u32,     // size of the current bitonic sequence
  total: u32, // padded element count
  pad: u32,
}

@group(0) @binding(0) var<uniform> params: SortParams;
@group(0) @binding(1) var<storage, read_write> keys: array<Key>;

@compute @workgroup_size(256)
fn cs_main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let i = globalId.x;
  if (i >= params.total) {
    return;
  }

  let partner = i ^ params.j;
  if (partner <= i) {
    return;
  }

  let a = keys[i];
  let b = keys[partner];

  let ascending = (i & params.k) == 0u;
  let needSwap = select(a.dist > b.dist, a.dist < b.dist, ascending);
  if (needSwap) {
    keys[i] = b;
    keys[partner] = a;
  }
}
