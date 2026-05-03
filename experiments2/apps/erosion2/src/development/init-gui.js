import GUI from "lil-gui";
import Settings from "../Settings";
import Config from "../Config";

const gui = new GUI();
gui.title("Experiment Controls");
const { refresh, reload } = Settings;

gui.add(Config, "useSimulation").onChange(reload);
if (Config.useSimulation) {
  const fSimulation = gui.addFolder("Simulation Parameters").open();
  fSimulation.add(Config, "numDroplets", [128, 192, 256]).onChange(reload);
  fSimulation.add(Config, "splatScale", 0.1, 2).onFinishChange(reload);
  fSimulation.add(Config, "minSlope", 0.01, 0.25).onFinishChange(reload);
  fSimulation.add(Config, "gravity", 0, 20).onFinishChange(reload);
  fSimulation.add(Config, "inertia", 0, 0.5).onFinishChange(reload);
  fSimulation.add(Config, "evaporationRate", 0, 5).onFinishChange(reload);
  fSimulation.add(Config, "erosionRate", 0, 0.1).onFinishChange(reload);
  fSimulation.add(Config, "depositionRate", 0, 20).onFinishChange(reload);

  const fMaps = gui.addFolder("Debug Maps").open();
  fMaps.add(Config, "showDroplets").onChange(refresh);
  fMaps.add(Config, "showErosion").onChange(refresh);
}

const fSystem = gui.addFolder("System");
fSystem.addColor(Config, "background").onChange(refresh);
fSystem.add(Config, "useTargetSize").onChange(reload);
if (Config.useTargetSize) {
  fSystem.add(Config, "margin", 0, 200).onFinishChange(reload);
}
fSystem.add(Settings, "saveConfig").name("Save Config");
fSystem.add(Settings, "reset").name("Reset Defaults");
