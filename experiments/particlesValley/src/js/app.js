import '../scss/global.scss';
import alfrid, { Camera } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
// import dat from 'dat-gui';

const GL = alfrid.GL;
const assets = [
	{ id:'lightmap', url:'assets/img/lightmap.jpg' },
	{ id:'map', url:'assets/img/ripple.png' },
];

window.params = {
	numParticles:128 * 2,
	skipCount:10,
	dotSize:0.005,
	invertOffset:new alfrid.TweenNumber(0),
	particlesAlpha:new alfrid.TweenNumber(1),
}

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
	document.body.classList.remove('isLoading');
	window.assets = o;

	_init3D();
}

let state = 0;
let scene;

function _init3D() {

	//	CREATE CANVAS
	const canvas = document.createElement('canvas');
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT 3D TOOL
	GL.init(canvas);

	if (GL.isMobile) {
		document.body.classList.add('is-mobile');
	}

	//	INIT DAT-GUI
	// window.gui = new dat.GUI({ width:300 });

	//	CREATE SCENE
	scene = new SceneApp();


	window.addEventListener('keydown', (e)=> {
		// console.log(e.keyCode);

		if( e.keyCode === 32) {
			toggleState();
		} else if(e.keyCode === 84) {
			toggleTheme();
		} else if(e.keyCode === 80) {
			scene.post = !scene.post;
		}
	})
}


function toggleState() {
	state = state === 0 ? 1 : 0;
	scene.setState(state);
	params.particlesAlpha.easing = state === 0 ? 'expIn' : 'expOut';
	params.particlesAlpha.value = state === 0 ? 1 : 0;
}

function toggleTheme() {
	params.invertOffset.value = params.invertOffset.value === 0 ? 1 : 0;
	document.body.classList.remove('is-invert');
	if(params.invertOffset.targetValue === 1) {
		document.body.classList.add('is-invert');
	}
}