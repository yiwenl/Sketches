import {
  GL,
  DrawAxis,
  DrawCopy,
  CameraPerspective,
  OrbitalControl,
} from "@experiments2/alfrid";
import { random } from "@experiments2/utils";

import Scheduler from "scheduling";

import { Assets } from "./Assets";

let camera, control, dAxis, dCopy;

Assets.load().then(() => {
  console.log(Assets.get("test"));
  console.log(Assets.get("model"));

  init();
});

function init() {
  GL.init();

  const pixelRatio = 2;
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

  Scheduler.addEF(loop);
}

function loop() {
  GL.viewport(0, 0, GL.width, GL.height);
  GL.clear(0, 0, 0, 1);
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
