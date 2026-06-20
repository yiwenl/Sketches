import { createRoot } from "react-dom/client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ComposerFlow, PipelineConfig } from "@effect-composer-ui";
import { EffectComposer, ShaderPass, createCurvePass, createVignettePass, createFXAAPass, createContrastBrightnessPass, createHueSaturationPass, createGradientMapPass, type Device } from "belfast";
import contrastShaderCode from "./shaders/contrast.wgsl?raw";

let uiRoot: ReturnType<typeof createRoot> | null = null;
let uiContainer: HTMLDivElement | null = null;
let openBtnContainer: HTMLDivElement | null = null;

export function toggleUI() {
  if (uiContainer) {
    if (uiContainer.style.display === "none") {
      uiContainer.style.display = "block";
      uiContainer.style.pointerEvents = "auto";
      if (openBtnContainer) openBtnContainer.style.display = "none";
    } else {
      uiContainer.style.display = "none";
      uiContainer.style.pointerEvents = "none";
      if (openBtnContainer) openBtnContainer.style.display = "block";
    }
  }
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16) / 255.0,
    parseInt(result[2], 16) / 255.0,
    parseInt(result[3], 16) / 255.0
  ] : [0, 0, 0];
};

export function initUI(
  device: Device,
  composer: EffectComposer,
  initialConfig?: PipelineConfig,
  initialGraph?: { nodes: any[]; edges: any[] }
) {
  if (uiRoot) return;

  uiContainer = document.createElement("div");
  uiContainer.style.position = "absolute";
  uiContainer.style.top = "0";
  uiContainer.style.left = "0";
  uiContainer.style.width = "100vw";
  uiContainer.style.height = "100vh";
  uiContainer.style.zIndex = "9999";
  uiContainer.style.pointerEvents = "auto";
  document.body.appendChild(uiContainer);

  uiRoot = createRoot(uiContainer);

  const handleConfigChange = (config: PipelineConfig) => {
    const currentPasses = composer.passes;
    const newPasses: ShaderPass[] = [];

    for (let i = 0; i < config.passes.length; i++) {
      const passConfig = config.passes[i];
      let pass: ShaderPass | undefined;

      const existingPass = currentPasses[i];
      const expectedLabel = 
        passConfig.type === "gradientMap" ? "GradientMapPass" :
        passConfig.type === "fxaa" ? "FXAAPass" :
        passConfig.type === "vignette" ? "VignettePass" :
        passConfig.type === "contrastBrightness" ? "ContrastBrightnessPass" :
        passConfig.type === "hueSaturation" ? "HueSaturationPass" :
        passConfig.type === "contrast" ? "ContrastPass" :
        passConfig.type === "curve" ? "CurvePass" : "";

      if (existingPass && existingPass.name === expectedLabel) {
        pass = existingPass;
      } else {
        if (passConfig.type === "curve") {
          pass = createCurvePass(device);
        } else if (passConfig.type === "contrast") {
          pass = new ShaderPass(device, contrastShaderCode, {
            label: "ContrastPass",
            uniforms: { contrast: "f32" },
          });
        } else if (passConfig.type === "vignette") {
          pass = createVignettePass(device);
        } else if (passConfig.type === "fxaa") {
          pass = createFXAAPass(device);
        } else if (passConfig.type === "contrastBrightness") {
          pass = createContrastBrightnessPass(device);
        } else if (passConfig.type === "hueSaturation") {
          pass = createHueSaturationPass(device);
        } else if (passConfig.type === "gradientMap") {
          pass = createGradientMapPass(device);
        }
      }

      if (pass) {
        if (passConfig.type === "curve") {
          const [x1, y1, x2, y2] = passConfig.params.curve;
          pass.setUniform("x1", x1);
          pass.setUniform("y1", y1);
          pass.setUniform("x2", x2);
          pass.setUniform("y2", y2);
        } else if (passConfig.type === "contrast") {
          pass.setUniform("contrast", passConfig.params.contrast);
        } else if (passConfig.type === "vignette") {
          pass.setUniform("radius", passConfig.params.radius);
          pass.setUniform("strength", passConfig.params.strength);
        } else if (passConfig.type === "fxaa") {
          const [w, h] = passConfig.params.resolution;
          pass.setUniform("resolution", [w, h]);
        } else if (passConfig.type === "contrastBrightness") {
          pass.setUniform("contrast", passConfig.params.contrast);
          pass.setUniform("brightness", passConfig.params.brightness);
        } else if (passConfig.type === "hueSaturation") {
          pass.setUniform("hue", passConfig.params.hue);
          pass.setUniform("saturation", passConfig.params.saturation);
        } else if (passConfig.type === "gradientMap") {
          const color1 = hexToRgb(passConfig.params.color1 || "#000000");
          const color2 = hexToRgb(passConfig.params.color2 || "#ffffff");
          pass.setUniform("color1", color1);
          pass.setUniform("color2", color2);
        }
        newPasses.push(pass);
      }
    }

    for (const p of currentPasses) {
      if (!newPasses.includes(p)) {
        p.destroy();
      }
    }

    composer.setPasses(newPasses);
  };

  const closeUI = () => {
    if (uiContainer) {
      uiContainer.style.pointerEvents = "none";
      uiContainer.style.display = "none";
    }
    if (openBtnContainer) {
      openBtnContainer.style.display = "block";
    }
  };

  const openUI = () => {
    if (uiContainer) {
      uiContainer.style.pointerEvents = "auto";
      uiContainer.style.display = "block";
    }
    if (openBtnContainer) {
      openBtnContainer.style.display = "none";
    }
  };

  openBtnContainer = document.createElement("div");
  openBtnContainer.style.position = "absolute";
  openBtnContainer.style.bottom = "20px";
  openBtnContainer.style.right = "20px";
  openBtnContainer.style.zIndex = "9998";
  openBtnContainer.style.display = "none";
  document.body.appendChild(openBtnContainer);
  
  const openBtnRoot = createRoot(openBtnContainer);
  openBtnRoot.render(
    <button 
      onClick={openUI}
      style={{ padding: "10px 20px", background: "#444", color: "#fff", border: "1px solid #666", borderRadius: "8px", cursor: "pointer", fontFamily: '"DM Sans", sans-serif' }}
    >
      Open Composer UI (⇧C)
    </button>
  );

  window.addEventListener("keydown", (e) => {
    if (e.key === "C" && e.shiftKey) {
      if (uiContainer && uiContainer.style.display === "none") {
        openUI();
      } else {
        closeUI();
      }
    }
  });

  const theme = createTheme({
    palette: {
      primary: {
        main: '#aee6ff',
        contrastText: '#101114',
      },
    },
    typography: {
      fontFamily: '"DM Sans", sans-serif',
      button: {
        textTransform: 'none'
      }
    },
  });

  uiRoot.render(
    <ThemeProvider theme={theme}>
      <ComposerFlow
        initialConfig={initialConfig}
        initialGraph={initialGraph}
        onChange={handleConfigChange}
        onClose={closeUI}
      />
    </ThemeProvider>
  );
}


