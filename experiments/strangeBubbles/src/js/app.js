import '../scss/global.scss';
import debugPolyfill from './debug/debugPolyfill';
import alfrid, { GL } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';

import assets from './asset-list';
import Assets from './Assets';

import ARUtils from './ARUtils';

if(document.body) {
	_init();
} else {
	window.addEventListener('DOMContentLoaded', _init);
}


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
		_init3D();
	}
}


function _onImageLoaded(o) {
	//	ASSETS
	console.log('Image Loaded : ', o);
	window.assets = o;
	const loader = document.body.querySelector('.Loading-Bar');
	console.log('Loader :', loader);
	loader.style.width = '100%';

	_init3D();

	setTimeout(()=> {
		document.body.classList.remove('isLoading');
	}, 250);
}

/*
THREE.ARUtils.getARDisplay().then(function (display) {
  if (display) {
    vrDisplay = display;
    init();
  } else {
    THREE.ARUtils.displayUnsupportedMessage();
  }
});
*/

function _init3D() {

	ARUtils.getARDisplay().then((display)=> {
		console.log('Display :', display);

		window.ARDisplay = display;
		console.log('is AR Kit ? ', ARUtils.isARKit(display));


		//	CREATE CANVAS
		const canvas = document.createElement('canvas');
		canvas.className = 'Main-Canvas';
		document.body.appendChild(canvas);

		//	INIT 3D TOOL
		GL.init(canvas, {ignoreWebgl2:true});
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio);

		//	INIT ASSETS
		Assets.init();

		//	CREATE SCENE
		const scene = new SceneApp();
	}, (e)=> {
		console.log('Error ', e);
	});
	
}