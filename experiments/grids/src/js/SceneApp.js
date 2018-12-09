// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

import ViewGrid from './ViewGrid';

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 8;

		this.mtx = mat4.create();
		let s = .1;
		mat4.scale(this.mtx, this.mtx, vec3.fromValues(s, s, s));

		setTimeout(()=> {
			gui.add(Config, 'speed', 0, 1).onChange(Settings.refresh);
			gui.add(Config, 'noise', 0, 1).onChange(Settings.refresh);
			gui.add(Config, 'numPoly', 2, 24).step(1).onFinishChange(Settings.reload);
			gui.add(Config, 'numLayers', 1, 50).step(1).onFinishChange(Settings.refresh);
		});
	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._vGrid = new ViewGrid();
	}


	render() {
		GL.clear(0, 0, 0, 0);

		GL.rotate(this.mtx);

		const scale = Config.numLayers;
		const numLayers = 40 * scale;

		for(let i=0; i<numLayers; i++) {

			let y = -numLayers/2 + i;
			this._vGrid.render( y / scale );	
		}
		
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;