# Shader Pass Nodes

All shader pass nodes are image pipeline nodes: they have a grey **target** handle on the left (image in) and a grey **source** handle on the right (image out). Place them in sequence between **Start** and **End**.

Pass nodes also expose small amber **named target handles** on the left side for each numeric parameter. Connect a [Value node](value-node.md) to these handles to drive that parameter dynamically instead of using the inline slider.

---

## Curve

**Type key:** `curve`  
**Component:** `ShaderPassNode`  
**Toolbar button:** Curve

Applies a cubic Bézier tone curve to the image. Useful for custom S-curves, lift/gain, and contrast shaping.

### Parameters

| Key | Type | Range | Default | Description |
|-----|------|-------|---------|-------------|
| `curve` | `[number, number, number, number]` | 0 – 1 per component | `[0.33, 0.33, 0.66, 0.66]` | Cubic Bézier control points `[x1, y1, x2, y2]` |

### UI

An interactive SVG Bézier editor is displayed inside the node. Two draggable control points adjust the curve shape. Numeric inputs below the editor allow precise entry.

---

## Contrast

**Type key:** `contrast`  
**Component:** `ShaderPassNode`  
**Toolbar button:** Contrast

Scales the luminance of the image around the midpoint.

### Parameters

| Key | Type | Range | Default | Named handle |
|-----|------|-------|---------|--------------|
| `contrast` | `number` | 0 – 2 | `1.0` | `contrast-in` |

---

## FXAA

**Type key:** `fxaa`  
**Component:** `ShaderPassNode`  
**Toolbar button:** FXAA

Fast Approximate Anti-Aliasing. Smooths aliased edges in screen space.

### Parameters

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `resolution` | `[number, number]` | `[1920, 1080]` | Render resolution used to compute texel size |

> Note: `resolution` is a 2-element array and is currently not editable via slider — it is passed as-is to the shader.

---

## Vignette

**Type key:** `vignette`  
**Component:** `ShaderPassNode`  
**Toolbar button:** Vignette

Darkens the corners and edges of the frame with a radial gradient.

### Parameters

| Key | Type | Range | Default | Named handle |
|-----|------|-------|---------|--------------|
| `radius` | `number` | 0 – 2 | `0.75` | `radius-in` |
| `strength` | `number` | 0 – 1 | `0.4` | `strength-in` |

`radius` controls how far the vignette reaches toward the centre. `strength` controls the maximum opacity of the darkening.

---

## ContrastBrightness

**Type key:** `contrastBrightness`  
**Component:** `ShaderPassNode`  
**Toolbar button:** Contrast+Bright

Combined contrast and brightness adjustment in a single pass.

### Parameters

| Key | Type | Range | Default | Named handle |
|-----|------|-------|---------|--------------|
| `contrast` | `number` | 0 – 2 | `1.0` | `contrast-in` |
| `brightness` | `number` | 0 – 2 | `1.0` | `brightness-in` |

Both parameters are applied multiplicatively. A value of `1.0` is neutral for both.

---

## HueSaturation

**Type key:** `hueSaturation`  
**Component:** `ShaderPassNode`  
**Toolbar button:** Hue+Sat

Rotates the hue of the image and scales its saturation.

### Parameters

| Key | Type | Range | Default | Named handle |
|-----|------|-------|---------|--------------|
| `hue` | `number` | 0 – 360 | `0` | `hue-in` |
| `saturation` | `number` | 0 – 2 | `1.0` | `saturation-in` |

`hue` is measured in degrees. `saturation` of `0` produces a greyscale image; `2` doubles saturation.

---

## GradientMap

**Type key:** `gradientMap`  
**Component:** `GradientMapNode`  
**Toolbar button:** Gradient Map

Remaps the image's luminance to a two-colour gradient. Dark pixels receive **Shadow color** and bright pixels receive **Highlight color**, with a smooth interpolation in between.

### Parameters

| Key | Type | Default | Named handle |
|-----|------|---------|--------------|
| `color1` | `string` (hex) | `"#000000"` | `color1-in` |
| `color2` | `string` (hex) | `"#ffffff"` | `color2-in` |

### UI

- A live gradient preview strip shows the current colour ramp.
- Each colour has an inline colour picker and a hex text input.
- Connect a [Color node](color-node.md) to `color1-in` (Shadow) or `color2-in` (Highlight) to drive the colours from a shared supplier node.

### Named colour handles

Two small cyan target handles appear on the left side of the node below the main image-in handle:

- **`color1-in`** — replaces Shadow color when a ColorNode is wired in.
- **`color2-in`** — replaces Highlight color when a ColorNode is wired in.

---

## ColorLookup

**Type key:** `colorLookup`  
**Component:** `ColorLookupNode`  
**Toolbar button:** Color Lookup

Applies a PNG LUT (look-up table) map to remap the colours of the image. The host WebGPU app reads `params.lutDataUrl` from the emitted `PipelineConfig`, decodes it with `createImageBitmap`, and uploads it to a `GPUTexture` used by the LUT shader pass.

### Parameters

| Key | Type | Default | Named handle |
|-----|------|---------|--------------|
| `lutDataUrl` | `string \| null` | `null` | — |
| `lutFileName` | `string \| null` | `null` | — |
| `strength` | `number` | `1.0` | `strength-in` |

`lutDataUrl` is a base64-encoded `data:image/png;base64,…` string. It is fully serializable — export/import round-trips preserve the embedded texture data.  
`lutFileName` is stored for display purposes only and is not used by the renderer.

### UI

- **Upload area** — click the "Click to upload PNG" button to open the OS file picker (accepts `.png` files only).
- **Thumbnail** — once a file is loaded, a small preview of the LUT image is shown.
- **File name + clear** — the selected file name is displayed alongside a "✕" button to remove the map.
- **Strength slider** — controls blend intensity from `0` (no effect) to `1` (full LUT). A [Value node](value-node.md) or [Ramp node](ramp-node.md) can be wired into `strength-in` to drive this value dynamically.

### Named handle

One small amber target handle appears on the left side of the node below the main image-in handle:

- **`strength-in`** — overrides the inline strength slider when a Value or Ramp node is wired in.
