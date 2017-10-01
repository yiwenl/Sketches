// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import AnimateCube from './AnimateCube';
import View4DCube from './View4DCube';
import Assets from './Assets';

var random = function(min, max) { return min + Math.random() * (max - min);	}
const numCubes = 0;

class SceneApp extends Scene {
	constructor() {
		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = 0.3;
		this.orbitalControl.radius.value = 10;

		// this.orbitalControl.lockZoom(true);

		GL.disable(GL.CULL_FACE);
	}

	_initTextures() {
	}

	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();

		this._vCube = new View4DCube();


		this._cubes = [];
		for(let i=0; i<numCubes; i++) {
			const cube = new AnimateCube();
			cube.randomTo();
			this._cubes.push(cube);
		}

		gui.add(this, 'spin');


		if(GL.isMobile) {
			window.addEventListener('click', ()=>this.spin());	
		} 

		window.addEventListener('keydown', (e)=> {
			if(e.keyCode === 32) {
				this.spin();
			}
		});
		
	}


	spin() {
		this._cubes.forEach( cube => {
			let delay = random(0, 200);
			setTimeout(()=> {
				cube.randomTo();	
			}, delay);
		});

	}


	render() {
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);

		this._bDots.draw();
		this._bAxis.draw();

		this._cubes.forEach( cube => {
			cube.render();
		});

		this._vCube.render();
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