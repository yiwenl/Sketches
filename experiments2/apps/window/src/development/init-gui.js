import GUI from "lil-gui";
import Settings from "../Settings";
import Config from "../Config";

const gui = new GUI();
gui.title("Experiment Controls");
const { refresh, reload } = Settings;

gui.add(Config, "numParticles", [256, 384, 512]).onChange(reload);

const fPointCloud = gui.addFolder("Point Cloud");
const r = 20;
fPointCloud.add(Config.pointCloud, "scale", 0, 0.5).onChange(refresh);
fPointCloud.add(Config.pointCloud, "x", -r, r).onChange(refresh);
fPointCloud.add(Config.pointCloud, "y", -r, r).onChange(refresh);
fPointCloud.add(Config.pointCloud, "z", -r, r).onChange(refresh);
fPointCloud.open();

const fFog = gui.addFolder("Fog");
fFog.add(Config.fog, "start", 0, 20).onChange(refresh);
fFog.add(Config.fog, "end", 20, 80).onChange(refresh);
fFog.add(Config.fog, "zCutoff", 0, 5).onChange(refresh);
fFog.open();

gui.addColor(Config, "background").onChange(refresh);
gui.add(Config, "useTargetSize").onChange(reload);
if (Config.useTargetSize) {
  gui.add(Config, "margin", 0, 200).onFinishChange(reload);
}
gui.add(Settings, "saveConfig").name("Save Config");
gui.add(Settings, "reset").name("Reset Defaults");
