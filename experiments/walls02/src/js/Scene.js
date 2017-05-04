// Scene.js

import HelperDotsPlane from './helpers/HelperDotsPlane';
import HelperAxis from './helpers/HelperAxis';
import Camera from './cameras/Camera';
import OrbitalControl from './helpers/OrbitalControl';

import parseObj from './loaders/objParser';
import vs from 'shaders/basic.vert';
import fs from 'shaders/test.frag';

class Scene {
	constructor() {
		this._init();
	}


	_init() {
		//	SETUP PIXI
		this.renderer = PIXI.autoDetectRenderer(window.innerWidth, window.innerHeight, {transparent:true, antialias:true});
		document.body.appendChild(this.renderer.view);
		this.renderer.view.className = 'Main-Canvas';
		this.stage = new PIXI.Container();

		//	CAMERAS
		this.camera = new Camera();
		const RAD = Math.PI/180;
		this.camera.setPerspective(75 * RAD, window.innerWidth / window.innerHeight, .1, 50);
		this.orbtialControl = new OrbitalControl(this.camera);

		//	MESH
		const helperDots = new HelperDotsPlane(this.camera);
		this.stage.addChild(helperDots);

		const helperAxis = new HelperAxis(this.camera);
		this.stage.addChild(helperAxis);


		const geometry = parseObj(getAsset('model'));
		

		const uniforms = {
			uViewMatrix:this.camera.view,
			uProjectionMatrix:this.camera.projection
		}

		const shader = new PIXI.Shader.from(vs, fs, uniforms);

		this.mesh = new PIXI.mesh.RawMesh(geometry, shader);
		this.stage.addChild(this.mesh);


		//	RENDERING
		this.render();
	}


	render() {
		requestAnimationFrame(()=>this.render());
		this.renderer.render(this.stage);
	}
}


export default Scene;