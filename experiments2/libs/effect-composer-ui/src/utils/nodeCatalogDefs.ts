/**
 * Static definitions for every node type that can be added via the picker or
 * the side panel. Both catalogs (`nodeCatalog` and `panelCatalog`) are derived
 * from this array at runtime by injecting the target position.
 */
export interface CatalogDef {
  group: string;
  label: string;
  /** The node type key used in `addPassNode`, or one of the special types. */
  nodeKind:
    | "shaderPass"
    | "gradientMap"
    | "colorLookup"
    | "colorNode"
    | "valueNode"
    | "rampNode";
  /** For shaderPass nodes, the pass-type label. */
  passType?: string;
  /** Default params injected into a shaderPass node. */
  defaultParams?: Record<string, any>;
}

export const NODE_CATALOG_DEFS: CatalogDef[] = [
  {
    group: "Nodes",
    label: "Curve",
    nodeKind: "shaderPass",
    passType: "curve",
    defaultParams: { curve: [0.33, 0.33, 0.66, 0.66] },
  },
  {
    group: "Nodes",
    label: "FXAA",
    nodeKind: "shaderPass",
    passType: "fxaa",
    defaultParams: { resolution: [1920, 1080] },
  },
  {
    group: "Nodes",
    label: "Vignette",
    nodeKind: "shaderPass",
    passType: "vignette",
    defaultParams: { radius: 0.75, strength: 0.4 },
  },
  {
    group: "Nodes",
    label: "Contrast/Brightness",
    nodeKind: "shaderPass",
    passType: "contrastBrightness",
    defaultParams: { contrast: 1.0, brightness: 1.0 },
  },
  {
    group: "Nodes",
    label: "Hue/Saturation",
    nodeKind: "shaderPass",
    passType: "hueSaturation",
    defaultParams: { hue: 0, saturation: 1.0 },
  },
  {
    group: "Nodes",
    label: "Gradient Map",
    nodeKind: "gradientMap",
  },
  {
    group: "Nodes",
    label: "Color Lookup",
    nodeKind: "colorLookup",
  },
  {
    group: "Values",
    label: "Color",
    nodeKind: "colorNode",
  },
  {
    group: "Values",
    label: "Value",
    nodeKind: "valueNode",
  },
  {
    group: "Values",
    label: "Ramp",
    nodeKind: "rampNode",
  },
];
