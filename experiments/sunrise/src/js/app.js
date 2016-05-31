import '../scss/global.scss';
import alfrid, { Camera } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
import dat from 'dat-gui';

const GL = alfrid.GL;
const assets = [
	// { id:'noise', url:'assets/img/noise.jpg' },
];


window.params = {
	debugNoise:false,
	zOffset:new alfrid.EaseNumber(0),
	maxRange:15,
	fadeInRange:1,
	fogOffset:0.01,
	globalTime:Math.random() * 0xFF,
	density:.25,
	weight:.1,
	decay:.85
};


const PATH_DROP = 'assets/img/inkDrops/inkDrops'
for (let i=0; i<35; i++) {
	let id = `inkDrops${i}`; 
	let url = `${PATH_DROP}${i}.jpg`;
	assets.push({
		id,
		url
	});
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


function _init3D() {

	//	CREATE CANVAS
	const canvas = document.createElement('canvas');
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT 3D TOOL
	GL.init(canvas);

	//	INIT DAT-GUI
	window.gui = new dat.GUI({ width:300 });

	//	CREATE SCENE
	const scene = new SceneApp();

}

