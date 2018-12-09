// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

import Noise from './Noise';
import ViewFloor from './ViewFloor';
import ViewDome from './ViewDome';
import getColorTheme from 'get-color-themes';

const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const getColor = () => {
	let colors = getColorTheme();

	return shuffle(colors);
}


const mix = (a, b, p) => {
	return a * (1 - p) + b * p;
}

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		// this.orbitalControl.rx.value = 0.3;
		this.orbitalControl.radius.value = 5;

		this._count = 0;
		this._num = 60 * 4;


		const fov = 60 * Math.PI / 180;
		this.camera.setPerspective(fov, GL.aspectRatio, .1, 100);


		this._colors0 = getColor();
		this._colors1 = getColor();

		const s = 30;
		this.mtx = mat4.create();
		mat4.translate(this.mtx, this.mtx, vec3.fromValues(0, -1.75, -s/2));
		mat4.rotateX(this.mtx, this.mtx, .05);


		setTimeout(()=> {
			gui.add(Config, 'speed', 0, 2).onFinishChange(Settings.refresh);
			gui.add(Config, 'noise', 1, 10).onFinishChange(Settings.refresh);
		}, 500);
	}

	_initTextures() {
		console.log('init textures');

		this._noise = new Noise();
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._vFloor = new ViewFloor();
		// this._vDome = new ViewDome();
	}

	updateColor() {

		this._colors0 = this._colors1.concat();
		this._colors1 = getColor();
		
		this._count = 0;
	}


	render() {
		this._noise.update();

		if(this._count ++ >= this._num) {
			this.updateColor();
		}

		let p = this._count / this._num;

		// console.log(this._colors0[4]);
		let r = mix(this._colors0[4][0], this._colors1[4][0], p);
		let g = mix(this._colors0[4][1], this._colors1[4][1], p);
		let b = mix(this._colors0[4][2], this._colors1[4][2], p);
		GL.clear(r, g, b, 1);

		
		GL.rotate(this.mtx);
		// this._vDome.render(this._colors0, this._colors1, p);
		this._vFloor.render(this._noise.texture, this._colors0, this._colors1, p);

		let s = 200;
		GL.viewport(0, 0, s, s);

		GL.disable(GL.DEPTH_TEST);
		// this._bCopy.draw(this._noise.texture);
		GL.enable(GL.DEPTH_TEST);
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;