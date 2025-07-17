import {
  GL,
  DrawAxis,
  DrawCopy,
  CameraPerspective,
  OrbitalControl,
} from "@experiments2/alfrid";
import { random } from "@experiments2/utils";
import GUI from "lil-gui";

import Scheduler from "scheduling";
import Assets from "./Assets";
import Config from "./Config";
import Settings from "./Settings";

let camera, control, dAxis, dCopy, gui;
const pixelRatio = 2;

Settings.init();

Assets.load().then(init);

function init() {
  GL.init();

  GL.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
  document.body.appendChild(GL.canvas);
  GL.canvas.id = "main-canvas";

  GL.clear(random(), random(), random(), 1);
  dAxis = new DrawAxis();
  dCopy = new DrawCopy();

  camera = new CameraPerspective();
  camera.setPerspective((75 * Math.PI) / 180, GL.aspectRatio, 0.1, 100);
  camera.lookAt([5, 5, 5], [0, 0, 0]);

  control = new OrbitalControl(camera);
  control.rx.value = -0.5;
  control.ry.value = -0.5;

  initGui();

  Scheduler.addEF(loop);
}

function initGui() {
  gui = new GUI();
  gui.title("Experiment Controls");
  const { refresh, reset } = Settings;

  gui.addColor(Config, "background").onChange(refresh);
  gui.add(Settings, "reset").name("Reset Defaults");
}

function loop() {
  GL.viewport(0, 0, GL.width, GL.height);
  const bg = Config.background;
  GL.clear(...bg, 1);
  GL.setMatrices(camera);
  dAxis.draw();

  const w = 600;
  const map = Assets.get("test");
  const ratio = map.width / map.height;
  const h = w / ratio;
  GL.viewport(0, 0, w, h);
  dCopy.draw(map);
}

function resize() {
  GL.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
  camera.setAspectRatio(GL.aspectRatio);
}

window.addEventListener("resize", resize);
