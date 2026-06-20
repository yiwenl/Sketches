# Effect Composer UI — Node Reference

A node-based visual editor for building post-processing effect pipelines. Built with React Flow, MUI, and a dark utility canvas aesthetic.

## Node Categories

### Image Pipeline Nodes

These nodes process the image stream from left to right. Connect them in sequence from **Start** to **End** to build your pipeline.

| Node | Type key | Description |
|------|----------|-------------|
| [Start](nodes/start-end.md#startnode) | `start` | Canvas input — entry point of every pipeline |
| [End](nodes/start-end.md#endnode) | `end` | Screen output — final node in every pipeline |
| [Curve](nodes/shader-passes.md#curve) | `curve` | Tone-map via a cubic Bézier curve |
| [Contrast](nodes/shader-passes.md#contrast) | `contrast` | Single contrast slider |
| [FXAA](nodes/shader-passes.md#fxaa) | `fxaa` | Fast approximate anti-aliasing |
| [Vignette](nodes/shader-passes.md#vignette) | `vignette` | Radial darkening at the edges |
| [Contrast + Brightness](nodes/shader-passes.md#contrastbrightness) | `contrastBrightness` | Combined contrast and brightness control |
| [Hue + Saturation](nodes/shader-passes.md#huesaturation) | `hueSaturation` | Hue rotation and saturation scaling |
| [Gradient Map](nodes/shader-passes.md#gradientmap) | `gradientMap` | Remap luminance to a two-colour gradient |

### Value Supplier Nodes

These nodes sit freely on the canvas and output a single typed value. Wire them into named parameter handles on pass nodes to drive parameters dynamically.

| Node | Type key | Output handle | Accepted by |
|------|----------|---------------|-------------|
| [Color](nodes/color-node.md) | `colorNode` | `output` (cyan handle) | `color1-in`, `color2-in` on Gradient Map |
| [Value](nodes/value-node.md) | `valueNode` | `output` (amber handle) | `contrast-in`, `brightness-in`, `hue-in`, `saturation-in`, etc. on any pass |

## Connection Rules

1. **Image pipeline** — connect the grey right-side handle of one pass node to the grey left-side handle of the next. The pipeline must start at **Start** and end at **End**.
2. **Value suppliers** — connect the cyan (`Color`) or amber (`Value`) source handle to a named target handle on a pass node. Named handles appear as small coloured dots on the left side of the pass node, below the main image-in handle.
3. **Fallback** — when no supplier is connected, pass nodes use their own inline sliders and pickers as the active value.

## Exporting and Importing

Use the **Export** button to download the full graph (nodes + edges) as JSON. Use **Import** to restore it. The exported `PipelineConfig` emitted via `onChange` always contains resolved param values — it is safe to pass directly to a shader effect composer renderer.

## Architecture Overview

```
ComposerFlow
├── nodeTypes registry (ShaderPassNode, GradientMapNode, ColorNode, ValueNode, StartNode, EndNode)
├── nodes / edges state (React Flow)
├── notifyChange()        — traverses the pipeline, resolves supplier values, emits PipelineConfig
├── handleParamChange()   — updates node data in place
├── handleColorNodeChange() / handleValueNodeChange() — update supplier node data + re-emit
└── Toolbar              — buttons to add any node type
```
