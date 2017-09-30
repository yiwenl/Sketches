// debug.js
import dat from 'dat-gui';
import Stats from 'stats.js';
import alfrid, { GL } from 'alfrid';

console.log('Init GUI');

//	INIT DAT-GUI
window.gui = new dat.GUI({ width:300 });
const div = document.body.querySelector('.dg.ac');
div.style.zIndex = '999';

//	STATS
const stats = new Stats();
document.body.appendChild(stats.domElement);
alfrid.Scheduler.addEF(()=>stats.update());