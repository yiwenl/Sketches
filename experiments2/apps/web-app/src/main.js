import {
  GL,
  DrawAxis,
  CameraPerspective,
  OrbitalControl,
} from "@experiments2/alfrid";
import { random } from "@experiments2/utils";

import Scheduler from "scheduling";

GL.init();

const pixelRatio = 2;
GL.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
document.body.appendChild(GL.canvas);
GL.canvas.id = "main-canvas";

GL.clear(random(), random(), random(), 1);
const dAxis = new DrawAxis();

const camera = new CameraPerspective();
camera.setPerspective((75 * Math.PI) / 180, GL.aspectRatio, 0.1, 100);
camera.lookAt([5, 5, 5], [0, 0, 0]);

const control = new OrbitalControl(camera);
control.rx.value = -0.5;
control.ry.value = -0.5;

function loop() {
  GL.clear(0, 0, 0, 1);
  GL.setMatrices(camera);
  dAxis.draw();
}

Scheduler.addEF(loop);

function resize() {
  GL.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
  camera.setAspectRatio(GL.aspectRatio);
}

window.addEventListener("resize", resize);

const img = new Image();
img.src = "./test.png";
document.body.appendChild(img);
