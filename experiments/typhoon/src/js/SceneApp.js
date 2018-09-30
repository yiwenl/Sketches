// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';

import ViewGlobe from './ViewGlobe';
import ViewTest from './ViewTest';

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.rx.value = 1.5;
		this.orbitalControl.radius.value = 5;
		this.orbitalControl.radius.limit(3, 10);
		// this.orbitalControl.lock();

		// alfrid.Scheduler.next(()=> {
		// 	gui.add(Config, 'speed', 0, 2).onChange(Settings.refresh);
		// 	gui.add(Config, 'shift', -Math.PI, Math.PI).onChange(Settings.refresh);
		// 	gui.add(this, 'toggle');
		// });


		this.offset = new alfrid.TweenNumber(0, 'expIn', 0.01)
		this._mode = 'plane';

		window.addEventListener('keydown', (e)=> {
			// console.log(e.keyCode);

			if(e.keyCode === 32) {
				this.toggle();
			}
		})
	}


	toggle() {
		this._mode = this._mode === 'plane' ? 'sphere' : 'plane';

		this.offset.easing = this._mode === 'plane' ? 'cubicInOut' : 'cubicIn';
		this.offset.value = this._mode === 'plane' ? 0 : 1;
		const RAD = Math.PI / 180;

		this.orbitalControl.rx.value = this._mode === 'plane' ? 1.5 : 0.3;
		this.orbitalControl.ry.value = this._mode === 'plane' ? 0.0 : -15 * RAD;

		const delay = this._mode === 'plane' ? 2.5 : 0;

		if(this._mode === 'sphere') {
			this.orbitalControl.radius.value = 6;
		} else {
			this.orbitalControl.radius.value = 7;
			const delay = 0.5;
			setTimeout(()=> {
				this.orbitalControl.radius.value = 3;
			}, delay * 1000);			
		}

	}

	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();

		this._vGlobe = new ViewGlobe();
		this._vTest = new ViewTest();
	}
	

	render() {
		GL.clear(0, 0, 0, 0);

		this._bDots.draw();
		this._vGlobe.render(this.offset.value);
		this._vTest.render(this.offset.value);
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;