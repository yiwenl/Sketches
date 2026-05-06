# Helpers

Small **debug and visualization** utilities: wireframe frustum, shaded sphere markers, world axes, and a depth-texture picture-in-picture. Each helper expects an existing **`GPURenderPassEncoder`** with a **`depth24plus`** attachment (depth test on where noted); they only issue draws and state changes on that pass.

## Contents

| File | Class | Purpose |
|------|--------|---------|
| `camera_helper.js` | `CameraHelper` | Line-list **view frustum** (12 edges) in world space, tinted by constructor `color`. |
| `sphere_helper.js` | `SphereHelper` | Low-poly **UV sphere** with per-draw model matrix (position + radius) and RGBA color. |
| `axes.js` | `Axes` | Long **RGB axis lines** (±X red, ±Y green, ±Z blue) through the origin. |
| `texture_debug.js` | `TextureDebug` | **Full-screen triangle** restricted to a viewport; samples a **depth** texture for grayscale debug. |
| `shaders/axes.wgsl` | — | Vertex color lines for `Axes`. |
| `shaders/debug_quad.wgsl` | — | Procedural quad + depth sampling / contrast remap. |

In this repo, **`CameraHelper`**, **`SphereHelper`**, and **`TextureDebug`** are used from `src/main.js` when **`Config.showDebug`** is true. **`Axes`** is included here but **not** wired into the demo yet.

---

## `CameraHelper`

- **Shader** is embedded as a string in the JS file (simple view-projection + per-vertex color).
- **`render(pass, camera, helperCamera)`**  
  - Inverts **`helperCamera.viewProjectionMatrix`** and unprojects eight NDC corners (near/far planes at \(z=0\) and \(z=1\) in NDC) to world space.  
  - Builds 24 vertices (`line-list`) for the frustum edges, uploads them each frame, and draws with **`camera.viewProjectionMatrix`** so you see **another camera’s frustum** (here: the **light** / shadow camera) from the main view.
- **Blending**: alpha premultiplied-style color blending on the color target; **depth write on**, **`less`** test.

Constructor: **`new CameraHelper(device, format, color?)`** — `color` defaults to orange-ish `[1, 0.6, 0.2, 0.8]`.

---

## `SphereHelper`

- Procedural **16×16** lat/long mesh at radius 1 in model space; **`render`** applies **`translate(position)`** and **`scale(radius)`**.
- Uniform block: view-projection, model matrix, **`vec4` color** (written each `render`).
- **Blending** + **depth** same general pattern as `CameraHelper` (alpha blend, depth write, `less`).

**`render(pass, camera, position, radius = 0.5, color = [1,1,1,1])`** — `position` is a `vec3`-like array; uses **`gl-matrix`** on the CPU.

---

## `Axes`

- Six vertices (three line segments), axis length **100** units each direction from the origin; vertex layout is position `float32x3` + color `float32x3`.
- **`render(pass, camera)`** — Writes `camera.viewProjectionMatrix`; **no blending** in the fragment shader (opaque RGBA).

Useful as a **world orientation** reference when debugging transforms. Requires `shaders/axes.wgsl` (imported `?raw`).

---

## `TextureDebug`

- Renders a **two-triangle quad** in clip space (`vertex_index` only), then samples **`texture_depth_2d`** with a **`non-filtering`** sampler (required for depth compare in WebGPU).
- **`render(pass, textureView, x, y, width, height)`**:
  - Calls **`pass.setViewport(x, y, width, height, 0, 1)`** so the quad fills that **pixel rectangle** (handy for HUD / PiP).
  - Caches the bind group until **`textureView`** changes.
- **Depth**: attachment `depth24plus`, **`depthCompare: 'always'`**, **`depthWriteEnabled: false`** so the overlay won’t fight the scene depth.
- Fragment shader remaps depth with **`clamp((d - 0.9) * 10.0, 0, 1)`** so typical perspective depths are easier to see (tuned for “most geometry near 0.9+”).

In the demo, **`shadowView`** (shadow map depth) is shown in the bottom-left when debug is on.

---

## Dependencies

| Helper | Imports |
|--------|---------|
| `CameraHelper`, `SphereHelper`, `Axes` | `../core/gpu_utils.js`; frustum/sphere also use **`gl-matrix`**. |
| `TextureDebug` | Only the **`debug_quad.wgsl`** file (no `GPUUtils`). |

All constructors take **`(device, format)`** where **`format`** is the **swapchain / scene color format** (e.g. from `Renderer.format`), so fragment targets match the active render pass.

---

## Porting / reuse

Copy **`src/helpers/`** together with **`gl-matrix`** (if you use camera/sphere helpers) and **`gpu_utils`** (for buffer helpers). Helpers are **not** tied to `Renderer` beyond needing a compatible color `format` and a depth attachment when depth testing is enabled.

To use **`Axes`**, instantiate it like the other helpers and call **`axes.render(pass, camera)`** inside your debug branch.
