// SceneApp.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

import KoiSimulation from './KoiSimulation';
import ViewFloor from './ViewFloor';
import ViewFish from './ViewFish';

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 10;

		this._koiSim = new KoiSimulation();


		alfrid.Scheduler.next(()=> {
			gui.add(Config, 'numParticles', 1, 32).name('Number of fishes').step(1).onFinishChange(Settings.reload);
			gui.add(Config.fish, 'uFishScale', 0, 1).name('Fish Scale').onChange(Settings.refresh);
			gui.add(Config.simulation, 'uDrawDistance', 0, 5).onChange(Settings.refresh);
			gui.add(Config.simulation, 'uDrawForce', 0, 10).onChange(Settings.refresh);
			gui.add(Config.simulation, 'uFishCapY', 0, 1).onChange(Settings.refresh);
		});

		this._hit = vec3.create();
		this._touch = vec3.create();

		const detector = new TouchDetector(this._vFloor.mesh, this.camera);
		this._touchForce = new alfrid.EaseNumber(0, 0.01);
		detector.on('onHit', (e) => {
			vec3.copy(this._hit, e.detail.hit);
			vec3.copy(this._touch, e.detail.hit);
			this._hit[1] += 1;
			this._touchForce.value = 1;
		});

		detector.on('onUp', (e) => {
			vec3.set(this._hit, 999, 999, 999);
			vec3.set(this._touch, 999, 999, 999);
			this._touchForce.value = 0;
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
		this._bBall = new alfrid.BatchBall();

		this._vFloor = new ViewFloor();
		this._vFishes = new ViewFish();
	}


	renderShadow() {
		this._vFishes.render(this._koiSim.texture, this._koiSim.textureExtra);
	}


	render() {
		//	update fish position
		this._koiSim.update(this._hit, this._touchForce.value);

		GL.clear(0, 0, 0, 0);

		this._bAxis.draw();
		this._bDots.draw();


		this._vFloor.render();
		this._vFishes.render(this._koiSim.texture, this._koiSim.textureExtra);

		let s = 0.1;
		this._bBall.draw(this._touch, [s, s, s], [1, 1, 1]);

		s = Config.numParticles * 4;
		GL.viewport(0, 0, s * 2, s);
		this._bCopy.draw(this._koiSim.texture);
		GL.viewport(s*2, 0, s, s);
		this._bCopy.draw(this._koiSim.textureExtra);
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;