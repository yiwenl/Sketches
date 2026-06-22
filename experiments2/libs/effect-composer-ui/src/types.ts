export type PassType =
  | "vignette"
  | "curve"
  | "contrast"
  | "fxaa"
  | "contrastBrightness"
  | "hueSaturation"
  | "gradientMap"
  | "colorLookup";

export interface PassConfig {
  id: string;
  type: PassType;
  params: Record<string, any>;
}

export interface PipelineConfig {
  passes: PassConfig[];
}
