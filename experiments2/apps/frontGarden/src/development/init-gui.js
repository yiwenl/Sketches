import GUI from "lil-gui";
import Settings from "../Settings";
import Config from "../Config";

const gui = new GUI();
gui.title("Experiment Controls");
const { refresh, reload } = Settings;

let isVisible = true;

window.addEventListener("keydown", (e) => {
  if (e.key === "h") {
    isVisible = !isVisible;
    isVisible ? gui.show() : gui.hide();
  }
});

const fRegion = gui.addFolder("Region");
const r = 10;
const s = 0.01;
fRegion.add(Config, "regionX", -r, r).step(s).onChange(refresh);
fRegion.add(Config, "regionY", -r, r).step(s).onChange(refresh);
fRegion.add(Config, "regionZ", -r, r).step(s).onChange(refresh);
fRegion.add(Config, "regionRadius", 0, 3).step(s).onChange(refresh);
fRegion.add(Config, "regionIndex", 0, 9).step(1).onChange(refresh);

gui.addColor(Config, "background").onChange(refresh);
gui.add(Config, "useTargetSize").onChange(reload);
if (Config.useTargetSize) {
  gui.add(Config, "margin", 0, 200).onFinishChange(reload);
}
gui.add(Settings, "saveConfig").name("Save Config");
gui.add(Settings, "reset").name("Reset Defaults");
