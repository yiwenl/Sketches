import GUI from "lil-gui";
import Settings from "../Settings";
import Config from "../Config";
import MountainLinesExporter from "../MountainLinesExporter";

export const gui = new GUI();
gui.title("Experiment Controls");
const { refresh, reload } = Settings;

let isVisible = true;
gui.hide();

window.addEventListener("keydown", (e) => {
  if (e.key === "h") {
    isVisible = !isVisible;
    if (isVisible) {
      gui.show();
    } else {
      gui.hide();
    }
  }
});

gui.add(Config, "useSimulation").onChange(reload);
const fSimulation = gui.addFolder("Simulation Parameters").open();
if (Config.useSimulation) {
  fSimulation.add(Config, "numDroplets", [128, 192, 256]).onChange(reload);
  fSimulation.add(Config, "numSteps", 100, 1000).step(1).onFinishChange(reload);
  fSimulation.add(Config, "splatScale", 0.1, 2).onFinishChange(reload);
  fSimulation.add(Config, "minSlope", 0.01, 0.25).onFinishChange(reload);
  fSimulation.add(Config, "gravity", 0, 2).onFinishChange(reload);
  fSimulation.add(Config, "inertia", 0, 0.5).onFinishChange(reload);
  fSimulation.add(Config, "evaporationRate", 0, 5).onFinishChange(reload);
  fSimulation.add(Config, "erosionRate", 0, 0.1).onFinishChange(reload);
  fSimulation.add(Config, "depositionRate", 0, 20).onFinishChange(reload);

  const fMaps = gui.addFolder("Debug Maps").open();
  fMaps.add(Config, "showDroplets").onChange(refresh);
  fMaps.add(Config, "showErosion").onChange(refresh);
}

const fPlots = gui.addFolder("Plots").open();
fPlots.add(Config, "linesThreshold", 0, 1).onChange(refresh);
fPlots
  .add(Config, "lineStyle", ["parallel", "diagonal", "circular"])
  .name("Line Style")
  .onChange(() => {
    MountainLinesExporter.reset();
    refresh();
  });
fPlots
  .add(Config, "diagonalDirection")
  .name("Reverse Diagonal")
  .onChange(() => {
    MountainLinesExporter.reset();
    refresh();
  });
fPlots
  .add(Config, "density", 0.1, 10)
  .name("Line Density")
  .onFinishChange(reload);

const fSystem = gui.addFolder("System");
fSystem.addColor(Config, "background").onChange(refresh);
fSystem.add(Config, "useTargetSize").onChange(reload);
if (Config.useTargetSize) {
  fSystem.add(Config, "margin", 0, 200).onFinishChange(reload);
}
const fLight = gui.addFolder("Light").open();
fLight
  .add(Config, "lightRotationY", 0, Math.PI * 2)
  .name("Light Rotation Y")
  .onChange(refresh);
fLight
  .add(Config, "lightRotationX", -Math.PI, 0)
  .name("Light Rotation X")
  .onChange(refresh);
fLight
  .add(Config, "spotLightAngle", 0, Math.PI)
  .name("Spot Light Angle")
  .onChange(refresh);
fLight
  .add(Config, "spotLightFalloff", 0, 5)
  .name("Spot Light Falloff")
  .onChange(refresh);

fSystem.add(Settings, "saveConfig").name("Save Config");
fSystem.add(Settings, "reset").name("Reset Defaults");

export const getGui = () => gui;
export const getSimulationGui = () => fSimulation;
