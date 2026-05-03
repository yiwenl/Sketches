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

gui.addColor(Config, "background").onChange(refresh);
gui.add(Config, "useTargetSize").onChange(reload);
if (Config.useTargetSize) {
  gui.add(Config, "margin", 0, 200).onFinishChange(reload);
}
gui.add(Settings, "saveConfig").name("Save Config");
gui.add(Settings, "reset").name("Reset Defaults");
