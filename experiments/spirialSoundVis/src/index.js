import alfrid from 'alfrid';
import SceneApp from './js/SceneApp';
import dat from 'dat-gui';
import './scss/global.scss';

window.params = {
};

if(document.body) {
	_init();
} else {
	window.addEventListener('load', ()=>_init());
}

function _init() {
	//	CREATE CANVAS
	let canvas = document.createElement("canvas");
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT GL TOOL
	alfrid.GL.init(canvas);

	//	INIT SCENE
	let scene = new SceneApp();

	//	GUI
	window.gui = new dat.GUI({width:300});
}