import Stats from "stats.js";
import Scheduler from "scheduling";
const stats = new Stats();
document.body.appendChild(stats.domElement);
stats.domElement.style.position = "fixed";
stats.domElement.style.left = "0";
stats.domElement.style.bottom = "0";
stats.domElement.style.top = "auto";

let statsVisible = true;
window.addEventListener("keydown", (e) => {
  if (!e.shiftKey || e.key.toLowerCase() !== "s") return;
  statsVisible = !statsVisible;
  stats.domElement.style.display = statsVisible ? "block" : "none";
});

Scheduler.addEF(() => {
  stats.update();
});
