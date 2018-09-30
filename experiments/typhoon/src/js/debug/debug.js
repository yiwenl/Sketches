// debug.js
import dat from 'dat-gui';
import Stats from 'stats.js';
import Settings from '../Settings';
import Config from '../Config';
import alfrid, { GL } from 'alfrid';


//	STATS
const stats = new Stats();
document.body.appendChild(stats.domElement);
alfrid.Scheduler.addEF(()=>stats.update());


//	INIT DAT-GUI
window.gui = new dat.GUI({ width:300 });
const div = document.body.querySelector('.dg.ac');
div.style.zIndex = '999';


gui.add(Config, 'num', 12, 120).step(1).onFinishChange(Settings.reload);
