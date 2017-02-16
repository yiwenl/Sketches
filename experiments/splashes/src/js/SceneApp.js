// SceneApp.js

import alfrid, { Scene, GL, Ray } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewHouse from './ViewHouse';
import Ball from './Ball';
import Assets from './Assets';
import Splashes from './Splashes';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.rx.limit(0, Math.PI/2 - 0.1);
		this.orbitalControl.radius.value = 15;
		this.orbitalControl.radius.limit(5, 20);

		this._ray = new Ray([0, 0, 0], [0, 0, -1]);
		this._hit = vec3.fromValues(-999, -999, -999);

		this._modelMatrix = mat4.create();

		this._splashes = new Splashes();
		this._ballScale = new alfrid.EaseNumber(0.1, 0.03);

		window.addEventListener('mousedown', (e)=>this._onDown(e));
		window.addEventListener('mouseup', (e)=>this._onUp(e));
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
		this._ball = new Ball();

		// this._vModel = new ViewObjModel();
		this._vHouse = new ViewHouse();
	}


	_onDown(e) {
		this._timeDown = Date.now();
	}


	_onUp(e) {
		const t = Date.now();
		if(t - this._timeDown > 200) return;
		const mx = (e.clientX / GL.width) * 2.0 - 1.0;
		const my = - (e.clientY / GL.height) * 2.0 + 1.0;

		this.camera.generateRay([mx, my, 0], this._ray);
		const mesh = this._vHouse.mesh;

		if(!this.faceVertices) {
			this.faceVertices = mesh.faces.map((face)=>(face.vertices));
		}

		let hit;
		let v0, v1, v2;
		let dist = 0;

		for(let i = 0; i < this.faceVertices.length; i++) {
			const vertices = this.faceVertices[i];
			v0 = [vertices[0][0], vertices[0][1], vertices[0][2]];
			v1 = [vertices[1][0], vertices[1][1], vertices[1][2]];
			v2 = [vertices[2][0], vertices[2][1], vertices[2][2]];

			let t = this._ray.intersectTriangle(v0, v1, v2);
			// if(hit) {	break;	}

			if(t) {
				if(hit) {
					const distToCam = vec3.dist(t, this.camera.position);
					if(distToCam < dist) {
						hit = vec3.clone(t);
						dist = distToCam;
					}
				} else {
					hit = vec3.clone(t);
					dist = vec3.dist(hit, this.camera.position);
				}	
			}
		}


		if(hit) {
			this._hit = vec3.clone(hit);
			this._ball.launch(this.camera.position, hit);
			this._ballScale.setTo(0.1);
			this._ballScale.value = 0;
			this._vHouse.addDrop(this.camera.position, hit);
		}
		
	}


	render() {
		GL.clear(1, 1, 1, 1);
		this._vHouse.render(Assets.get('studio_radiance'), Assets.get('irr'), Assets.get('aoHouse'));

		const s = this._ballScale.value;
		this._bBall.draw(this._ball.position, [s, s, s], [.1, .1, .1], 1);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;