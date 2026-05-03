import GUI from "lil-gui";
import Settings from "../Settings";
import Config from "../Config";

const gui = new GUI();
gui.title("Experiment Controls");
const { refresh, reload } = Settings;

gui.add(Config, "numParticles", [128, 192, 256, 320, 384]).onChange(reload);

gui.addColor(Config, "background").onChange(refresh);
gui.add(Config, "useTargetSize").onChange(reload);
if (Config.useTargetSize) {
  gui.add(Config, "margin", 0, 200).onFinishChange(reload);
}
gui.add(Settings, "saveConfig").name("Save Config");
gui.add(Settings, "reset").name("Reset Defaults");
