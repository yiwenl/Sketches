import Stats from "stats.js";
import Scheduler from "scheduling";

const stats = new Stats();
document.body.appendChild(stats.dom);

Scheduler.addEF(() => {
  stats.update();
});
