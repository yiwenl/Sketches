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
  const key = e.key.toLowerCase();
  const shouldToggleStats = (e.shiftKey && key === "s") || key === "h";
  if (!shouldToggleStats) return;
  statsVisible = !statsVisible;
  stats.domElement.style.display = statsVisible ? "block" : "none";
});

Scheduler.addEF(() => {
  stats.update();
});
