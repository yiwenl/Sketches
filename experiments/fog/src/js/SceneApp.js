// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';

import ViewCubes from './ViewCubes';
import ViewFog from './ViewFog';
import ViewTrafficLight	 from './ViewTrafficLight';
import Noise3D from './Noise3D';
import Light from './Light';
import { renderLight } from './utils';
import getColorTheme from 'get-color-themes';

const interval = 15;

var random = function(min, max) { return min + Math.random() * (max - min);	}


class SceneApp extends Scene {
	constructor() {

		super();
		this.resize();
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.rx.value = -0.2;
		this.orbitalControl.ry.value = 0.9;
		this.orbitalControl.rx.limit(-0.5, 1);

		this.mtx = mat4.create();
		mat4.translate(this.mtx, this.mtx, vec3.fromValues(0, -3.0, 0));

		const cameraRadius = 7;
		this.orbitalControl.radius.value = cameraRadius;
		// this.orbitalControl.radius.limit(cameraRadius, cameraRadius);


		this.pStart = vec3.fromValues(-2.5, 0, 0);
		this.dir = vec3.fromValues(1, .1, 0);
		vec3.normalize(this.dir, this.dir);
		this.pEnd = vec3.clone(this.dir);
		vec3.scale(this.pEnd, this.pEnd, 5);
		vec3.add(this.pEnd, this.pEnd, this.pStart);


		this._lights = [];
		let base = .25;

		this.positions = [
			[-0.475, 3.314, 1.911],
			[-0.475, 3.153, 1.911],
			[-0.475, 2.99, 1.911]
		]
		const colours = [
			[1, base, base],
			[1, 1, base],
			[2/255, 243/255, 233/255]
		];
		this.colours = colours;
		let i = Config.numLights;
		let range = 1;
		let gap = .5;
		let sz = -(Config.numLights * gap)/2;

		while(i--) {
			let origin = vec3.clone(this.positions[i])
			let dir = vec3.fromValues(0, 0, -1);
			let color = colours[i%colours.length];
			const light = new Light(origin, dir, color);

			this._lights.push(light);
		}

		this._vFog.setupLights(this._lights);

		this._count = 0;
	}


	_initTextures() {
		console.log('init textures');

		this._noises = new Noise3D(Config.noiseNum, Config.noiseScale);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bBall = new alfrid.BatchBall();

		this._vCubes = new ViewCubes();
		this._vFog = new ViewFog();
		this._vTrafficLight = new ViewTrafficLight();
	}


	updateFog() {
		this._count = 0;
		this._noises.update();
	}


	render() {
		this._count ++;
		if(this._count >= interval) {
			this.updateFog();
		}

		GL.clear(0, 0, 0, 0);
		GL.rotate(this.mtx);

		this._vTrafficLight.render();
		
		let s = 0.04;
		this.positions.forEach( (pos, i) => {
			this._bBall.draw(pos, [s, s, s], this.colours[i]);
		});

		// this._lights.forEach( light => renderLight(light) );
		this._vFog.render(this.pStart, this.dir, this._noises.texture0, this._noises.texture1, this._count / interval)


		// this._bCopy.draw(this._noises.texture0);
	}


	toResize(w, h) {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		w = w || innerWidth;
		h = h || innerHeight;
		GL.setSize(w, h);
		let tw = Math.min(w, innerWidth);
		let th = Math.min(h, innerHeight);

		const sx = innerWidth / w;
		const sy = innerHeight / h;
		const scale = Math.min(sx, sy);
		tw = w * scale;
		th = h * scale;

		GL.canvas.style.width = `${tw}px`;
		GL.canvas.style.height = `${th}px`;
		this.camera.setAspectRatio(GL.aspectRatio);
	}

	resize() {
		this.toResize(window.innerWidth, window.innerHeight);
	}
}


export default SceneApp;