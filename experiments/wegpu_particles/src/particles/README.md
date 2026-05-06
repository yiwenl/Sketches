# Particles

GPU **billboard particle system**: hundreds of thousands of quads driven by one interleaved **storage buffer**, a **compute** integration step that follows the **fluid** field, and a **volumetric light grid** fed by particle speeds for glow in the fragment shader. **Shadows** use a separate depth-only pass into a fixed-resolution map with PCF in the main pass.

## Contents

| File | Role |
|------|------|
| `particle_system.js` | Orchestrates buffers, render + shadow + simulation pipelines, bind groups, `update` / `render` / `renderShadow`. |
| `particle_data.js` | CPU initialization of the particle buffer layout (`ParticleData`). |
| `light_grid.js` | `64³` atomic splat + normalize into a `rgba16float` 3D texture (`LightGrid`). |
| `shaders/particles.wgsl` | Billboard vertex, lit fragment (spot + shadow + color maps + glow), depth-only shadow fragment. |
| `shaders/simulation.wgsl` | Per-particle compute: life, fluid sampling, boundary forces, integration. |
| `shaders/light_grid.wgsl` | `splat` (particles → atomic grid) and `post_process` (atoms → 3D texture). |
| `shaders/noise.wgsl` | Included into `simulation.wgsl` by `processShader` (same file the fluid solver uses); **current `main` does not call noise**—integration is fluid + containment only. |

---

## Data layout (`ParticleData`)

Each particle is **20 floats** (80 bytes), aligned for use as both **vertex instance data** and **`storage` struct** in WGSL:

| Offsets (float index) | Fields |
|----------------------|--------|
| 0–3 | `position` (xyz), `speed` (scalar from init, used as a weight in fluid influence) |
| 4–7 | `velocity` (xyz), `life` |
| 8–11 | `color` (rgb), `size` |
| 12–15 | `extra` (vec3, per-particle variation for shading / fluid mix), `lifeDecrease` |
| 16–19 | `origin` (xyz), pad |

`ParticleSystem` uploads `this.particles.buffer` into **`GPUBufferUsage.VERTEX | STORAGE | COPY_DST`**.

On the GPU, `simulation.wgsl` also reads/writes **`currentSpeed`** (length of velocity before clamp); that field is **not** filled on the CPU at init—the compute pass sets it every frame. `LightGrid` splats use **`currentSpeed`** for intensity.

---

## `ParticleSystem`

### Constructor

**`new ParticleSystem(device, format, shadowDepthTexture, fluidVelocityTextures, fluidDensityTextures, colorMap1Texture, colorMap2Texture, numParticles?, config?)`**

- **`fluidVelocityTextures` / `fluidDensityTextures`**: length-2 arrays of **ping-pong 3D textures** (same objects as `FluidSystem.velocities` / `densities`).
- **`shadowDepthTexture`**: **`depth32float`** depth target; main pass binds a **`sampler_comparison`** for PCF.
- **`colorMap1Texture` / `colorMap2Texture`**: 2D maps; fragment shader mixes them using speed and `extra`-derived UVs.
- **`config`** defaults include **`maxRadius`**, **`sphereRadius`**, **`particleScale`**, **`noiseScale`**, **`forceStrength`**, **`speedScale`**, **`maxSpeed`**, **`shadowScaleBoost`**; **`glowIntensity`** is read in **`update()`** (`Config.glowIntensity` in the demo).

Internally constructs **`ParticleData`**, **`LightGrid`**, pipelines, and **two simulation bind groups** that bind **`fluidVelocityTextures[0|1]`** and **`fluidDensityTextures[0|1]`**.

### `update(deltaTime, totalTime, _, _, vIn, dIn)`

The middle texture arguments are **unused**; fluid inputs come from the **pre-built bind groups** indexed by **`vIn`**. Call this with **`fluidSystem.vIn`** (and keep **`dIn`** in sync with how density was updated—**in this repo**, `main` passes **`fluidSystem.dIn`** for consistency, though bind groups only vary by **`vIn`**).

Per frame it:

1. Writes **simulation uniforms** (`deltaTime`, scaled `totalTime`, `maxRadius`, noise/force/speed params—note **`noiseScale` / `forceStrength`** are passed through but the **current** `simulation.wgsl` **`main`** does not apply curl noise, only fluid + boundaries).
2. **Compute dispatch**: `workgroup_size(64)`, `ceil(numParticles / 64)` workgroups.
3. **`lightGrid.update(encoder, ...)`** on the **same** command encoder: splat + post into the 3D glow texture.
4. **`queue.submit`** one finished encoder.

**Order relative to fluid:** run **`fluidSystem.update`** first, then **`particleSystem.update`** with **`fluidSystem.vIn`** so velocity/density textures match the latest fluid step.

### `render(pass, camera, lightCamera)`

- Uploads **`Uniforms`** (`particles.wgsl`): view/proj, **shadow matrix** (NDC bias × `lightCamera.viewProjectionMatrix`), **light position**, **spot cone** (inner/outer cos from `lightCamera.fov`), **`isShadowPass = 0`**, `particleScale`, `maxSpeed`, `maxRadius`, etc.
- **Instanced draw**: 6 quad vertices × **`numParticles`**; vertex shader billboards in **view space**, scales by size × speed × optional **shadow scale boost** in shadow pass (not used here—shadow uses separate entry point).
- Bindings: uniform buffer, shadow depth + comparison sampler, two color maps + samplers, **3D `glowTexture`** + linear sampler (`LightGrid.texture`).

### `renderShadow(pass, lightCamera)`

- Fills **`shadowUniformBuffer`** with **`lightCamera`** matrices, **`isShadowPass = 1`**, and draws with **`fs_shadow`** (targets: none—depth only).
- **`pass.setViewport(0, 0, 2048, 2048, 0, 1)`** — must match the shadow map resolution used when creating the depth texture (see `main.js`).

Billboard size in shadow pass is inflated by **`shadowScaleBoost`** in the vertex shader so particles cast a slightly **fatter** silhouette.

---

## `LightGrid`

- **Grid**: `64 × 64 × 64` **`atomic<u32>`** buffer + **`rgba16float`** 3D texture output.
- **`splat`**: one thread per particle (dispatch `ceil(numParticles / 64)`); trilinear weights into 8 voxels; contribution ∝ **`currentSpeed`**, **`glowIntensity`**, edge falloff; **`atomicAdd`** into the grid.
- **`post_process`**: workgroups **`4×4×4`**, `16×16×16` groups cover the cube; **`atomicExchange(..., 0)`** to read/clear, scale, write **`texture_storage_3d`**.

**`createBindGroup(particleBuffer)`** is called lazily on first **`update`**.

Uniforms: **`deltaTime`**, **`maxRadius`**, **`glowIntensity`**, **`decay`** (written as `0.95`; decay is mainly conceptual—the post step clears atomics each frame).

---

## Shading highlights (`particles.wgsl`)

- **Circular quads** — `discard` when UV radius &gt; 0.5.
- **Shadow** — 3×3 **PCF** with `textureSampleCompare` on **`shadowMap`**.
- **Lighting** — inverse-square-ish falloff, **spotlight** smoothing between inner/outer cos.
- **Color** — blend of two textures keyed off speed thresholds; **glow** samples **`glowTexture`** in world space `((WorldPos / maxRadius) * 0.5 + 0.5)`, then boosts brightness; contrast/saturation tweaks at the end.

---

## Dependencies & reuse

| Import | Role |
|--------|------|
| `../core/gpu_utils.js` | Buffer creation |
| `../utils/shader_utils.js` | `#include "noise.wgsl"` |
| `../utils/math.js` | Random helpers in `ParticleData` |
| `gl-matrix` | Shadow matrix + CPU prep in `ParticleSystem` / `ParticleData` |

**Tight coupling:** This module expects **`FluidSystem`**-style 3D textures and consistent **`maxRadius`** with fluid force domains and floor/shadow setup in the parent app.

To port: copy **`src/particles/`**, keep **`noise.wgsl`** resolvable (same `processShader` glob behavior), supply a **`depth32float`** shadow map + **matching viewport**, two color **2D** textures, and call **`update`/`render`/`renderShadow`** in the same order as `main.js`.

---

## Demo wiring (this repo)

`src/main.js`: builds **`ParticleSystem`** with **`Config.numParticles`** and textures from **`fluidSystem`**; each frame syncs **`particleSystem.config`** from **`Config`** (including **`glowIntensity`** and pulsed **`maxSpeed`**), runs **fluid → particles → shadow encoder →** scene pass with **`particleSystem.render`**.
