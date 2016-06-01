// SceneApp.js

import alfrid, { Scene } from 'alfrid';
import ViewObjModel from './ViewObjModel';
import ViewCrystals from './ViewCrystals';
import Scheduler from 'scheduling';

window.getAsset = function (id) {
	for(var i = 0; i < assets.length; i++) {
		if(id === assets[i].id) {
			return assets[i].file;
		}
	}
};

const GL = alfrid.GL;

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		const RAD = Math.PI/180;
		this.camera.setPerspective(75 * RAD, GL.aspectRatio, .1, 50);
		this.orbitalControl.radius.value = 3;

		this._ray = new alfrid.Ray([0, 0, 0], [0, 0, -1]);

		this._touchForces = [];
		this._touches = [];
		for(let i=0; i<params.numTouches; i++) {
			const n = new alfrid.TweenNumber(0, 'expOut', 0.01);
			this._touchForces.push(n);
			this._touches.push([-999, 0, 0]);
		}
	}

	_initTextures() {
		let irr_posx = alfrid.HDRLoader.parse(getAsset('irr_posx'));
		let irr_negx = alfrid.HDRLoader.parse(getAsset('irr_negx'));
		let irr_posy = alfrid.HDRLoader.parse(getAsset('irr_posy'));
		let irr_negy = alfrid.HDRLoader.parse(getAsset('irr_negy'));
		let irr_posz = alfrid.HDRLoader.parse(getAsset('irr_posz'));
		let irr_negz = alfrid.HDRLoader.parse(getAsset('irr_negz'));

		this._textureIrr = new alfrid.GLCubeTexture([irr_posx, irr_negx, irr_posy, irr_negy, irr_posz, irr_negz]);

		let rad_posx = alfrid.HDRLoader.parse(getAsset('rad_posx'));
		let rad_negx = alfrid.HDRLoader.parse(getAsset('rad_negx'));
		let rad_posy = alfrid.HDRLoader.parse(getAsset('rad_posy'));
		let rad_negy = alfrid.HDRLoader.parse(getAsset('rad_negy'));
		let rad_posz = alfrid.HDRLoader.parse(getAsset('rad_posz'));
		let rad_negz = alfrid.HDRLoader.parse(getAsset('rad_negz'));

		this._textureRad = new alfrid.GLCubeTexture([rad_posx, rad_negx, rad_posy, rad_negy, rad_posz, rad_negz]);

		this._textureAO = new alfrid.GLTexture(getAsset('aomap'));
	}


	_initViews() {
		// this._bCopy = new alfrid.BatchCopy();
		// this._bAxis = new alfrid.BatchAxis();
		// this._bDots = new alfrid.BatchDotsPlane();
		// this._bSkybox = new alfrid.BatchSkybox();

		this._bBall = new alfrid.BatchBall();
		this._vModel = new ViewObjModel();

		const strObj = getAsset('objCrystal');
		this.meshCrystal = alfrid.ObjLoader.parse(strObj);

		this._crystals = [];
		const NUM = 50;

		for(let i=0; i<NUM; i++) {
			if(i === 0) {
				const c = new ViewCrystals(i, NUM, this._vModel.mesh, this.meshCrystal);
				this._crystals.push(c);	
			} else {
				Scheduler.defer( () => {
					this._createCrystals(i, NUM);
				})
			}
		}

		window.addEventListener('mousemove', (e)=>this._onMove(e));
	}


	_onMove(e) {
		const mx = (e.clientX / GL.width) * 2.0 - 1.0;
		const my = - (e.clientY / GL.height) * 2.0 + 1.0;

		this.camera.generateRay([mx, my, 0], this._ray);

		const mesh = this._vModel.mesh;
		const faceVertices = mesh.faces.map((face)=>(face.vertices));;

		let hit;
		const offset = -1;
		let v0, v1, v2;

		for(let i = 0; i < faceVertices.length; i++) {
			const vertices = faceVertices[i];
			v0 = [vertices[0][0], vertices[0][1]+offset, vertices[0][2]];
			v1 = [vertices[1][0], vertices[1][1]+offset, vertices[1][2]];
			v2 = [vertices[2][0], vertices[2][1]+offset, vertices[2][2]];

			// hit = this._ray.intersectTriangle(vertices[0], vertices[1], vertices[2]);
			hit = this._ray.intersectTriangle(v0, v1, v2);
			if(hit) {
				break;
			}
		}

		function distance(a, b) {
			let v = vec3.create();
			vec3.sub(v, a, b);
			return vec3.length(v);
		}

		if(hit) {


			let last = this._touches[this._touches.length -1];
			const dist = distance(last, hit);
			if(dist > params.minRadius) {
				let touch = this._touches.shift();
				vec3.copy(touch, hit);
				this._touches.push(touch);

				let touchForce = this._touchForces.shift();
				touchForce.value = 1;
				this._touchForces.push(touchForce);
				this._touchForces[0].value = 0;
			}
			
		}

	}


	_createCrystals(i, num) {
		const c = new ViewCrystals(i, num, this._vModel.mesh, this.meshCrystal);
		this._crystals.push(c);	
	}


	render() {
		params.time += 0.01;
		GL.clear(0, 0, 0, 0);

		this._vModel.render(this._textureRad, this._textureIrr, this._textureAO);

		const shader = this._crystals[0].shader;

		this._crystals.map((crystal)=> {
			crystal.render(this._textureRad, this._textureIrr, alfrid.GLTexture.whiteTexture(), shader, this._touches, this._touchForces);
			return null;
		});
		
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;