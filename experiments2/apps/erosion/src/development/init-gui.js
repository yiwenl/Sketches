import GUI from "lil-gui";
import Settings from "../Settings";
import Config from "../Config";

const gui = new GUI();
gui.title("Experiment Controls");
const { refresh, reload } = Settings;

gui.add(Config, "numDroplets", [128, 192, 256]).onChange(reload);
gui.add(Config, "heightNoise", 0.1, 2).onFinishChange(reload);
gui.add(Config, "numStepsSimulation", 0, 1200).step(5).onFinishChange(reload);
gui.add(Config, "splatValue", 0.01, 0.2).step(0.01).onFinishChange(reload);
gui.add(Config, "splatRadius", 0.03, 0.2).step(0.01).onFinishChange(reload);
gui.add(Config, "sedimentCapacity", 0.1, 31).step(0.1).onFinishChange(reload);
gui.add(Config, "showDroplets").onChange(refresh);

gui.addColor(Config, "background").onChange(refresh);
gui.add(Config, "useTargetSize").onChange(reload);
if (Config.useTargetSize) {
  gui.add(Config, "margin", 0, 200).onFinishChange(reload);
}
gui.add(Settings, "saveConfig").name("Save Config");
gui.add(Settings, "reset").name("Reset Defaults");
