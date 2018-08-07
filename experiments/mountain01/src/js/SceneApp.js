// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

import ViewNoise from './ViewNoise';
import ViewMountain from './ViewMountain';

class SceneApp extends Scene {
	constructor() {

		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		const r = 5;
		// this.orbitalControl.radius.limit(r, r);
		this.orbitalControl.radius.value = r;
		// this.orbitalControl.center[1] = 2;



		// Config.normalScale = Config.height / Config.mountainSize;
		// Settings.refresh();
		
		this._generateMountain();


		const regenerate = () => {
			this._generateMountain();
			Settings.refresh();
		}


		setTimeout(()=> {
			gui.add(Config, 'NUM_TILE', 1, 10).step(1).onFinishChange(Settings.reload);
			gui.add(Config, 'NUM_OCTAVES', 1, 100).step(1).onFinishChange(regenerate);
			gui.add(Config, 'noiseScale', 1, 10).onFinishChange(regenerate);
			gui.add(Config, 'mountainSize', 1, 20).step(1).onFinishChange(Settings.reload);
			gui.add(Config, 'normalScale', 0, 1).onFinishChange(regenerate);
			gui.add(Config, 'height', 0, 5).onChange(Settings.refresh);
		}, 500);
	}

	_initTextures() {
		const fboSize = 1024 * 4;
		this._fbo = new alfrid.FrameBuffer(fboSize, fboSize, {
			type:GL.FLOAT,
			minFilter:GL.NEAREST,
			magFilter:GL.NEAREST,
		}, 2);

	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();


		this._vNoise = new ViewNoise();
		this._vMountain = new ViewMountain();

	}

	_generateMountain() {
		console.log('Generate mountain noise');
		this._fbo.bind();
		GL.clear(0, 0, 0, 0);

		this._vNoise.render();

		this._fbo.unbind();
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this._bAxis.draw();
		this._bDots.draw();

		let s = .25;
		const light = vec3.clone(Config.lightPos);
		vec3.normalize(light, light);
		vec3.scale(light, light, 5);

		this._bBall.draw(light, [s, s, s], [1, 1, .5]);

		this._vMountain.render(this._fbo.getTexture(0), this._fbo.getTexture(1), this.camera.position );


		s = 100;
		GL.viewport(0, 0, s, s);
		this._bCopy.draw(this._fbo.getTexture(0));
		GL.viewport(s, 0, s, s);
		this._bCopy.draw(this._fbo.getTexture(1));

	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;