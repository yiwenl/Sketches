// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import Config from './Config';

import RubixCube from './RubixCube';

import { 
	selectTop,
	selectBottom,
	selectLeft,
	selectRight,
	selectFront,
	selectBack
} from './utils';	


var random = function(min, max) { return min + Math.random() * (max - min);	}	


class SceneApp extends Scene {
	constructor() {

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.4;
		this.orbitalControl.radius.value = 12;

		this._cube = new RubixCube();

		const moveSets = [
			'Top',
			'Bottom',
			'Left',
			'Right',
			'Front',
			'Back'
		];


		// const interval = 800;

		// setInterval(()=> {
		// 	const move = moveSets[Math.floor(Math.random() * moveSets.length)];
		// 	console.log('Move', move);

		// 	const theta = Math.random() > .75 ? Math.PI : Math.PI/2;
		// 	const dir = Math.random() > .5 ? 1 : -1;

		// 	this._cube[`rotate${move}`](theta * dir);
		// }, interval);


		const controls = {
			rotateTopCW:() => {
				this._cube.rotateTop(-Math.PI/2);
			},
			rotateTopCCW:() => {
				this._cube.rotateTop();
			},

			rotateBottomCW:() => {
				this._cube.rotateBottom(-Math.PI/2);
			},
			rotateBottomCCW:() => {
				this._cube.rotateBottom();
			},

			rotateRightCW:() => {
				this._cube.rotateRight();
			},
			rotateRightCCW:() => {
				this._cube.rotateRight(-Math.PI/2);
			},

			rotateLeftCW:() => {
				this._cube.rotateLeft();
			},
			rotateLeftCCW:() => {
				this._cube.rotateLeft(-Math.PI/2);
			},

			random:() => {
				const move = moveSets[Math.floor(Math.random() * moveSets.length)];
				console.log('Move', move);

				const theta = Math.random() > .75 ? Math.PI : Math.PI/2;
				const dir = Math.random() > .5 ? 1 : -1;

				this._cube[`rotate${move}`](theta * dir);
			},

			shuffle:() => {
				let num = Math.floor(random(20, 30));
				controls.random();
				const interval = setInterval(()=> {
					if(num > 0) {
						controls.random();
						num --;
					} else {
						clearInterval(interval);
					}
				}, 700);

			}
		}


		setTimeout(()=> {
			// gui.add(controls, 'rotateTopCW');
			// gui.add(controls, 'rotateTopCCW');
			// gui.add(controls, 'rotateBottomCW');
			// gui.add(controls, 'rotateBottomCCW');
			// gui.add(controls, 'rotateRightCW');
			// gui.add(controls, 'rotateRightCCW');
			// gui.add(controls, 'rotateLeftCW');
			// gui.add(controls, 'rotateLeftCCW');

			moveSets.forEach( m => {
				// console.log('rotate${m}', `rotate${m}`);
				gui.add(this._cube, `rotate${m}`);
			});

			gui.add(controls, 'shuffle').name('Shuffle');
			gui.add(controls, 'random').name('Random Move');
			gui.add(this._cube, 'solve').name('Solve');
		}, 500);

	}


	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this._cube.render();
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