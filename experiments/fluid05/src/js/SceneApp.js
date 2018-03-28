// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';
import FboPingPong from './FboPingPong';
import FluidSimulation from './FluidSimulation';
import ViewPlane from './ViewPlane';
import ViewLines from './ViewLines';
import ViewRing from './ViewRing';
import Assets from './Assets';
import getMesh from './utils/getMesh';
import Config from './Config';
import PassNormal from './passes/PassNormal';
import PassBloom from './PassBloom';

class SceneApp extends Scene {
	constructor() {
		super();
		this.resize();
		this.camera.setPerspective(Math.PI/3, GL.aspectRatio, 1, 50);
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.8;
		this.orbitalControl.ry.value  = Math.PI/2;
		this.orbitalControl.rx.value  = 0.;
		// this.orbitalControl.ry.value = Math.PI;
		this.orbitalControl.radius.value = 2;
		// this.orbitalControl.radius.limit(2, 2);
		// this.orbitalControl.rx.limit(0.1, Math.PI / 2-0.1);


		// gui.add(params, 'height', 1, 5);
		// gui.add(params, 'cap', 0, 5);
	}

	_initTextures() {
		const s = 1024;
		this._fboNormal = new alfrid.FrameBuffer(s, s, {minFilter:GL.LINEAR, magFilter:GL.LINEAR});


		const oRender = {
			minFilter:GL.LINEAR,
			magFilter:GL.LINEAR,
			type:GL.FLOAT
		};

		this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height, oRender);
	}


	_initViews() {

		this._bCopy  = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._fluid  = new FluidSimulation(this.camera);

		this._vPlane = new ViewPlane();
		this._passNormal = new PassNormal();
		this._vLines = new ViewLines();
		this._vRing = new ViewRing();
		this._passBloom = new PassBloom(3);
	}


	render() {

		//	update fluid
		this._fluid.update();

		//	update normal 
		this._fboNormal.bind();
		GL.clear(0, 0, 0, 0);
		this._passNormal.render(this._fluid.density);
		this._fboNormal.unbind();


		//	first render
		// this._fboRender.bind();
		GL.clear(0, 0, 0, 0);

		this._bAxis.draw();

		// if(((params.type+1) & 2) > 0) {
		// 	this._vLines.render(this._fluid.density, this._fboNormal.getTexture(), Assets.get('studio_radiance'), Assets.get('irr'));	
		// } 

		// if(((params.type+1) & 1) > 0) {
		// 	this._vPlane.render(this._fluid.density, this._fboNormal.getTexture(), Assets.get('studio_radiance'), Assets.get('irr'));
		// }

		// this._fboRender.unbind();

		this._vRing.render(this._fluid.velocity);
		
		const s = 300;
		GL.viewport(0, 0, s * 2, s);
		this._bCopy.draw(this._fluid.velocity);
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;