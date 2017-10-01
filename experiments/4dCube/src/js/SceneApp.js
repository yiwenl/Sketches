// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import AnimateCube from './AnimateCube';
import View4DCube from './View4DCube';
import Assets from './Assets';

var random = function(min, max) { return min + Math.random() * (max - min);	}
const numCubes = GL.isMobile ? 20 : 40;

const getMouse = function(e) {
	if(e.touches) {
		return {
			x:e.touches[0].pageX,
			y:e.touches[0].pageY
		}
	} else {
		return {
			x:e.clientX,
			y:e.clientY
		}
	}
}

class SceneApp extends Scene {
	constructor() {
		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = 0.3;
		this.orbitalControl.radius.value = 12;
		this.orbitalControl.radius.easing = 0.03;
		this.orbitalControl.lockZoom(true);
		this.time = 0;

	}

	_initTextures() {
	}

	_initViews() {
		this._vCube = new View4DCube();


		this._cubes = [];
		for(let i=0; i<numCubes; i++) {
			const cube = new AnimateCube();
			cube.randomTo();
			this._cubes.push(cube);
		}

		gui.add(this, 'spin');


		window.addEventListener('mousedown', (e)=>this._onDown(e));
		window.addEventListener('mousemove', (e)=>this._onMove(e));
		window.addEventListener('mouseup', ()=>this._onUp());

		window.addEventListener('touchstart', (e)=>this._onDown(e));
		window.addEventListener('touchmove', (e)=>this._onMove(e));
		window.addEventListener('touchend', ()=>this._onUp());
		this._isMouseDown = false;
	}


	_onDown(e) {
		this._isMouseDown = true;
		this._cubes.forEach( cube => {
			cube.reset();
		});

		this._pointDown = getMouse(e);

		this.orbitalControl.radius.value = 10;
	}

	_onMove(e) {
		if(!this._isMouseDown) {
			return;
		}

		this._pointMove = getMouse(e);
		let dx = Math.abs(this._pointMove.x - this._pointDown.x);
		const maxDist = 500;
		let p = dx / maxDist;
		p = Math.min(p, 1.0);

		this._cubes.forEach( cube => {
			cube.offset = p;
		});
	}

	_onUp() {
		this._isMouseDown = false;
		this.orbitalControl.radius.value = 12;
	}


	spin() {
		this._cubes.forEach( cube => {
			let delay = random(0, 200);
			setTimeout(()=> {
				cube.randomTo();	
			}, delay);
		});

		this.orbitalControl.ry.value += Math.PI * random( .7, 1);
	}


	render() {
		this.time += 0.01;

		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);

		this._cubes.forEach( cube => {
			cube.render();
		});

		this._vCube.render();
		this._vCube.rotation += 0.01;
		this._vCube.rotationMask += 0.02;

		const scale = Math.sin(this.time) * .1 + .5;
		this._vCube.dx = scale;
		this._vCube.dy = scale;
		this._vCube.dz = scale;
	}

	resize() {
		let { innerWidth, innerHeight, devicePixelRatio } = window;
		if(!GL.isMobile) {
			devicePixelRatio = 1;	
		}
		
		GL.setSize(innerWidth * devicePixelRatio, innerHeight * devicePixelRatio);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;