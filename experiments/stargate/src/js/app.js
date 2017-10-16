import '../scss/global.scss';
import alfrid, { GL } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
import dat from 'dat-gui';
import Stats from 'stats.js';
import assets from './asset-list';
import Assets from './Assets';
import VRUtils from './utils/VRUtils';

if(document.body) {
	_init();
} else {
	window.addEventListener('DOMContentLoaded', _init);
}


window.params = {
	gamma:2.2,
	exposure:5,
	hdr:{
		gamma:1,
		exposure:15
	}
};

function _init() {

	//	LOADING ASSETS
	if(assets.length > 0) {
		document.body.classList.add('isLoading');

		const loader = new AssetsLoader({
			assets:assets
		})
		.on('error', (error)=>{
			console.log('Error :', error);
		})
		.on('progress', (p) => {
			// console.log('Progress : ', p);
			const loader = document.body.querySelector('.Loading-Bar');
			if(loader) loader.style.width = `${(p * 100)}%`;
		})
		.on('complete', _onImageLoaded)
		.start();

	} else {
		_initVR();
	}

}

let scene;

function _onImageLoaded(o) {
	//	ASSETS
	console.log('Image Loaded : ', o);
	window.assets = o;
	const loader = document.body.querySelector('.Loading-Bar');
	loader.style.width = '100%';

	_initVR();

	setTimeout(()=> {
		document.body.classList.remove('isLoading');
	}, 250);
}


function _initVR() {
	VRUtils.init( (vrDisplay) => _onVR(vrDisplay));
}

function _onVR(vrDisplay) {
	if(vrDisplay != null && VRUtils.canPresent) {
		document.body.classList.add('hasVR');
		let btnVR = document.body.querySelector('#enterVr');
		console.log('Button VR :', btnVR);
		btnVR.addEventListener('click', ()=> {
			VRUtils.present(GL.canvas, ()=> {
				document.body.classList.add('present-vr')
				scene.resize();
			});
		});
	} else {
		//	do nothing
	}


	_init3D();
}

function _init3D() {
	//	CREATE CANVAS
	const canvas = document.createElement('canvas');
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT 3D TOOL
	GL.init(canvas, {ignoreWebgl2:true});
	GL.enableAlphaBlending();

	//	INIT ASSETS
	Assets.init();

	//	INIT DAT-GUI
	// window.gui = new dat.GUI({ width:300 });

	//	CREATE SCENE
	scene = new SceneApp();

	//	STATS
	const stats = new Stats();
	document.body.appendChild(stats.domElement);
	alfrid.Scheduler.addEF(()=>stats.update());

	gui.add(params.hdr, 'gamma', 1, 10);
	gui.add(params.hdr, 'exposure', 1, 20);
}