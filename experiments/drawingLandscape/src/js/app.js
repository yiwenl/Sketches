import '../scss/global.scss';
import alfrid, { Camera } from 'alfrid';
import SceneApp from './SceneApp';
import AssetsLoader from 'assets-loader';
import dat from 'dat-gui';

const GL = alfrid.GL;

window.params = {
	terrainSize:20,
	gamma:2.2,
	exposure:2.5,
	debugHitPlane: false,
	minMountDist:2,
	maxNumMountains:50,
	maxRange:15,
	fadeInRange:1,
	fogOffset:0.01,
	fogDensity:0.05,
	numParticles:256,
	skipCount:10,
	maxRadius: 10,
};

const assets = [
	{ id:'bg', url:'assets/img/bg.jpg' },
	{ id:'noise', url:'assets/img/noise.jpg' },
	{ id:'aoTerrain', url:'assets/img/aoTerrain.jpg' },
	{ id:'objTerrain', url:'assets/obj/terrain.obj', type:'text' },
	{ id:'radiance', url:'assets/img/studio_radiance.dds', type: 'binary' },
	{ id:'irr_posx', url:'assets/img/irr_posx.hdr', type:'binary' },
	{ id:'irr_posx', url:'assets/img/irr_posx.hdr', type:'binary' },
	{ id:'irr_posy', url:'assets/img/irr_posy.hdr', type:'binary' },
	{ id:'irr_posz', url:'assets/img/irr_posz.hdr', type:'binary' },
	{ id:'irr_negx', url:'assets/img/irr_negx.hdr', type:'binary' },
	{ id:'irr_negy', url:'assets/img/irr_negy.hdr', type:'binary' },
	{ id:'irr_negz', url:'assets/img/irr_negz.hdr', type:'binary' },
];


for (let i=0; i<6; i++) {
	const id = `brush${i}`;
	const url = `assets/img/brushes/${id}.png`;
	const idNormal = `brushNormal${i}`
	const urlNormal = `assets/img/brushesNormal/${idNormal}.png`;
	assets.push({id, url});
	assets.push({id:idNormal, url:urlNormal});
}

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
	document.body.classList.remove('isLoading');
	window.assets = o;	

	_init3D();
}


function _init3D() {
	//	CREATE CANVAS
	let canvas = document.createElement('canvas');
	canvas.className = 'Main-Canvas';
	document.body.appendChild(canvas);

	//	INIT 3D TOOL
	GL.init(canvas);

	//	INIT DAT-GUI
	// window.gui = new dat.GUI({ width:300 });

	//	CREATE SCENE
	let scene = new SceneApp();

	// gui.add(params, 'debugHitPlane');
	// gui.add(params, 'gamma', 1, 5);
	// gui.add(params, 'exposure', 1, 25);
	// gui.add(params, 'fogDensity', 0, 0.1).step(0.001);
}