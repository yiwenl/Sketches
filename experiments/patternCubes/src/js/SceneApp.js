// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewCubes from './ViewCubes';
import ViewLines from './ViewLines';
import ViewMask from './ViewMask';
import TextureGenerator from './TextureGenerator';
import Assets from './Assets';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();

		this.cameraOrtho = new alfrid.CameraOrtho();

		// const s = 5;
		const scale = .01;
		const w = window.innerWidth/2 * scale;
		const h = window.innerHeight/2 * scale;
		this.cameraOrtho.ortho(-w, w, -h, h, -10000.1, 10000);

		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;


		this.useOrthoCamera = true;
		this.showTexture = false;
		gui.add(this, 'useOrthoCamera');
		gui.add(this, 'showTexture');

		this.control = new alfrid.OrbitalControl(this.cameraOrtho, window, 100);
		this.control.lock(true);
		const RAD = Math.PI/180;
		this.control.rx.value = 35.4 * RAD;
		this.control.ry.value = 45 * RAD;
	}

	_initTextures() {
		this._generator = new TextureGenerator();
		this.texture = this._generator.texture;
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();

		// this._vModel = new ViewObjModel();
		this._vCubes = new ViewCubes();
		this._vLines = new ViewLines();
		this._vMask = new ViewMask();

		GL.disable(GL.DEPTH_TEST);
		const s = 256 * 2;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this.texture);
		GL.enable(GL.DEPTH_TEST);	
	}


	render() {
		this._generator.update();
		
		GL.clear(0, 0, 0, 0);
		if(this.useOrthoCamera) {
			GL.setMatrices(this.cameraOrtho);	
		}
		
		GL.disable(GL.DEPTH_TEST);
		this._vLines.render();
		this._vMask.render();
		GL.enable(GL.DEPTH_TEST);
		this._vCubes.render(this.texture);


		if(this.showTexture) {
			GL.disable(GL.DEPTH_TEST);
			const s = 256 * 2;
			GL.viewport(0, 0, s, s);
			this._bCopy.draw(this.texture);
			GL.enable(GL.DEPTH_TEST);	
		}
		
	}


	resize() {
		const s = 1;
		GL.setSize(window.innerWidth * s, window.innerHeight * s);
		this.camera.setAspectRatio(GL.aspectRatio);

		const scale = .01;
		const w = window.innerWidth/2 * scale;
		const h = window.innerHeight/2 * scale;
		this.cameraOrtho.ortho(-w, w, -h, h, 0.1, 100);
	}
}


export default SceneApp;