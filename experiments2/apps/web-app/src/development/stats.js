import Stats from "stats.js";
import Scheduler from "scheduling";

const stats = new Stats();
document.body.appendChild(stats.dom);
console.log("Stats", stats);

Scheduler.addEF(() => {
  stats.update();
});
