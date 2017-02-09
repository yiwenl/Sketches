import '../scss/global.scss';
import alfrid, { GL } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
import dat from 'dat-gui';
import Stats from 'stats.js';
import assets from './asset-list';
import Assets from './Assets';
import SoundCloudBadge from './SoundCloudBadge';
import Sono from 'sono';
import SoundManager from './SoundManager';

window.params = {
	numRainDrops:100,
	numCubes:3000,
	numSets:5,
	terrainSize:40,
	numParticles:256 * 1.5,
	skipCount:3,
	maxRadius: 12,
	minBeatDiff:3.0,
	maxSum:150,
	lifeDecrease:0.0075,
	rotationSpeed:0.0015,
	respwanRadius:1.5,
	centery:1.5,
	zoom:0,
	showAxis:false,
	shadowMapSize:1024*2,
	speedOffset:new alfrid.TweenNumber(1, 'expInOut'),
	hasPaused:false,
	postEffect:false
};

window.hasVR = false;
window.vrPresenting = false;

if(document.body) {
	_init();
} else {
	window.addEventListener('DOMContentLoaded', _init);	
}


function _init() {
	SoundManager;
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
	GL.init(canvas);

	//	INIT ASSETS
	Assets.init();

	//	INIT DAT-GUI
	/*/
	window.gui = new dat.GUI({ width:300 });
	gui.add(params, 'maxRadius', 0.0, 15.0);
	gui.add(params, 'minBeatDiff', 0.0, 5.0).listen();
	gui.add(params, 'maxSum', 50.0, 200.0);
	gui.add(params, 'lifeDecrease', 0.0, 0.02).step(0.001).listen();
	gui.add(params, 'rotationSpeed', 0.0, 0.01).step(0.001);
	gui.add(params, 'respwanRadius', 0.0, 4.0);
	gui.add(params, 'centery', 0.0, 7.0);
	gui.add(params, 'zoom', 5.2, 20.5).step(0.01).listen();
	gui.add(params.speedOffset, 'value', 0, 1).listen();
	gui.add(params, 'showAxis');
	//*/

	//	CREATE SCENE
	const scene = new SceneApp();

	//	STATS

	//*/
	const stats = new Stats();
	document.body.appendChild(stats.domElement);
	alfrid.Scheduler.addEF(()=>stats.update());
	//*/

}