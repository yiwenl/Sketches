// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';
import Noise3DTexture from './Noise3DTexture';

import vs from 'shaders/plane.vert';
import fs from 'shaders/texture3D.frag';
import vsDebug from 'shaders/planeDebug.vert';
import fsCube from 'shaders/cube.frag';


class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 4;
		const r = Math.PI/4 * 0.001;

		this.orbitalControl.radius.limit(3, 6)
		// this.orbitalControl.rx.limit(-r, r);
		// this.orbitalControl.ry.value = Math.PI * 0.5;


		this.camera1 = new alfrid.CameraPerspective();
		this.camera1.setPerspective(45 * Math.PI / 180, GL.aspectRatio, 0.1, 100);
		this.camera1.lookAt([5, 5, 5], [0, 0, 0]);

		this.offset = 0.5;
		setTimeout(()=> {
			gui.add(this, 'offset', 0, 1).listen();	
			gui.add(Config, 'animated').onFinishChange(Settings.refresh);
		}, 200);


		let s = 0.8;
		// this.cube = alfrid.Geom.cube(s, s, s);
		this.cube = alfrid.Geom.sphere(s * 0.5, 36);
		this.shaderCube = new alfrid.GLShader(null, fsCube);
		
	}

	_initTextures() {
		console.log('init textures');

		this._noise3D = new Noise3DTexture(Config.noiseNum, 3.0);

		this._noise3D.render();
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		let s = 2;
		this.mesh = alfrid.Geom.plane(s, s, 1);
		this.shader = new alfrid.GLShader(vs, fs);
		this.shaderDebug = new alfrid.GLShader(vsDebug);
		


		const { numSlides } = Config;
		this.matrices = [];

		for(let i=0; i<numSlides; i++) {
			const mtx = mat4.create();
			let z = (i/numSlides - 0.5) * 2.0;
			mat4.translate(mtx, mtx, vec3.fromValues(0, 0, z));
			this.matrices.push(mtx);
		}
	}


	render() {
		if(Config.animated) {
			this._noise3D.render();
		}
		GL.clear(0, 0, 0, 0);

		// this._bAxis.draw();
		this._bDots.draw();

		GL.enableAlphaBlending();
		this.shaderCube.bind();
		GL.draw(this.cube);

		GL.enableAdditiveBlending();
		// GL.disable(GL.DEPTH_TEST);

		this.shader.bind();
		this.shader.uniform("uNum", "float", Config.noiseNum);
		this.shader.uniform("uNumSlices", "float", Config.numSlides);
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("uOffset", "float", this.offset);
		this._noise3D.getTexture().bind(0);

		this.matrices.forEach( mtx => {
			GL.rotate(mtx);
			GL.draw(this.mesh);	
		});
		

		GL.enableAlphaBlending();
		// GL.enable(GL.DEPTH_TEST);

		let s = 200;

		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._noise3D.getTexture());
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;