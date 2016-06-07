// SceneApp.js

import alfrid, { Scene } from 'alfrid';
import ViewSphere from './ViewSphere';
// import ViewSSAO from './ViewSSAO';

window.getAsset = function (id) {
	for(var i = 0; i < assets.length; i++) {
		if(id === assets[i].id) {
			return assets[i].file;
		}
	}
};

const GL = alfrid.GL;
let tmp = vec3.create();

class SceneApp extends alfrid.Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		GL.disable(GL.CULL_FACE);
		this._touches = [];
		this._touchForces = [];

		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;
		this._isMouseDown = false;
		this._ray = new alfrid.Ray([0, 0, 0], [0, 0, -1]);
		this.hit = [999, 999, 99999];

		window.addEventListener('mousedown', () => {	this._isMouseDown = true; });
		window.addEventListener('mouseup', () => {	this._isMouseDown = false; });
		window.addEventListener('mousemove', (e) => this._onMove(e));
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
		// this._fboRender = new alfrid.FrameBuffer(GL.width, GL.height);
		// this._fboSSAO = new alfrid.FrameBuffer(GL.width, GL.height);
	}


	_initViews() {
		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
		this._bBall = new alfrid.BatchBall();
		this._bSkybox = new alfrid.BatchSkybox();
		// this._vModel = new ViewObjModel();

		this._vSphere = new ViewSphere();
		// this._vAO = new ViewSSAO();
	}

	_onMove(e) {
		if(this._isMouseDown) return;
		// console.log('moving hit testing');

		const mx = (e.clientX / GL.width) * 2.0 - 1.0;
		const my = - (e.clientY / GL.height) * 2.0 + 1.0;

		this.camera.generateRay([mx, my, 0], this._ray);

		const mesh = this._vSphere.meshSphere;
		if(!this._faceVertices) {
			this._faceVertices = mesh.faces.map((face)=>(face.vertices));;			
		}

		const faceVertices = this._faceVertices;

		let hit;
		const offset = 0;
		let v0, v1, v2;

		this.hit = [999, 999, 99999];

		function distance(a, b) {
			vec3.sub(tmp, a, b);
			return vec3.length(tmp);
		}

		for(let i = 0; i < faceVertices.length; i++) {
			const vertices = faceVertices[i];
			v0 = [vertices[0][0], vertices[0][1]+offset, vertices[0][2]];
			v1 = [vertices[1][0], vertices[1][1]+offset, vertices[1][2]];
			v2 = [vertices[2][0], vertices[2][1]+offset, vertices[2][2]];

			hit = this._ray.intersectTriangle(v0, v1, v2);

			if(this._touches.length > 0 && hit) {
				for(let i=0; i<this._touches.length; i++) {
					if(distance(this._touches[this._touches.length-1], hit) < params.touchRadius/2) {
						hit = null;
						break;
					}
				}
			} 

			if(hit) {
				this._touches.push(vec3.clone(hit));
				let n = new alfrid.TweenNumber(0, "expIn", 0.02);
				n.value = 1;
				this._touchForces.push(n);

				if(this._touches.length > params.numTouches) {
					this._touches.shift();
					this._touchForces.shift();
				}

				break;
			}
		}

		if(this._touches.length === params.numTouches) {
			for(let i=0; i<params.numTouches/2; i++) {
				this._touchForces[i].easing = "expOut";
				this._touchForces[i].spped = 0.1;
				this._touchForces[i].value = 0;
			}
		}

	}


	render() {
		GL.clear(0, 0, 0, 0);
		this._vSphere.render(this._textureRad, this._textureIrr, this._touches, this._touchForces);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;