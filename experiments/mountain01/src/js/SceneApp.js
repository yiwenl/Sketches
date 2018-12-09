// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';
import ViewFloor from './ViewFloor';
import ViewLight from './ViewLight';
import Noise from './Noise';


class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;

		this.orbitalControl.positionOffset[1] = this.orbitalControl.center[1] = 1;

		// EXT_shader_texture_lod


		setTimeout(()=> {
			gui.add(Config, 'lightIntensity', 0, 10);
			gui.add(this._noise, 'reset').name('Regenerate');
		}, 500);
	}

	_initTextures() {
		console.log('init textures');

		const s = 2048;
		this._noise = new Noise(s, s);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._vLight = new ViewLight();
		this._vFloor = new ViewFloor(this._vLight.mesh.vertices);
		
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this._vLight.update(this.orbitalControl.ry.value);
		this._vFloor.render(this._vLight.mesh.vertices, this._vLight.matrix, this._noise.texture);
		


		let s = 250;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._noise.texture);
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;