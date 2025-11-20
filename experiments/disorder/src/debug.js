import Stats from "stats.js";
import Scheduler from "scheduling";
const stats = new Stats();
document.body.appendChild(stats.domElement);

Scheduler.addEF(() => {
  stats.update();
});
