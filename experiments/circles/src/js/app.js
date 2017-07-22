import '../scss/global.scss';
import alfrid, { GL } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
import dat from 'dat-gui';
import Stats from 'stats.js';
import assets from './asset-list';
import Assets from './Assets';

window.params = {
	numParticles:256*2,
	skipCount:10,
	maxRadius: 2.5
};

if(document.body) {
	_init();
} else {
	window.addEventListener('DOMContentLoaded', _init);	
}


function _init() {

	//	LOADING ASSETS
	if(assets.length > 0) {
		document.body.classList.add('isLoading');

		let loader = new AssetsLoader({
			assets:assets
		}).on('error', function (error) {
			console.error(error);
		}).on('progress', function (p) {
			// console.log('Progress : ', p);
			let loader = document.body.querySelector('.Loading-Bar');
			if(loader) loader.style.width = (p * 100).toFixed(2) + '%';
		}).on('complete', _onImageLoaded)
		.start();	
	} else {
		_init3D();
	}

}


function _onImageLoaded(o) {
	//	ASSETS
	console.log('Image Loaded : ', o);
	window.assets = o;
	const loader = document.body.querySelector('.Loading-Bar');
	loader.style.width = '100%';

	_init3D();

	setTimeout(()=> {
		document.body.classList.remove('isLoading');
	}, 250);
}


function _init3D() {
	
	//	CREATE CANVAS
	const canvas = document.createElement('canvas');
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT 3D TOOL
	GL.init(canvas, {ignoreWebgl2:true});

	//	INIT ASSETS
	Assets.init();

	//	INIT DAT-GUI
	window.gui = new dat.GUI({ width:300 });
	gui.add(params, 'maxRadius', 0.0, 10.0);

	//	CREATE SCENE
	const scene = new SceneApp();

	//	STATS
	const stats = new Stats();
	document.body.appendChild(stats.domElement);
	alfrid.Scheduler.addEF(()=>stats.update());

}