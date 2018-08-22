// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import Settings from './Settings';
import Config from './Config';
import PerspT from 'perspective-transform';

import vs from 'shaders/debug.vert';

class SceneApp extends Scene {
	constructor() {
		Settings.init();

		super();
		this.resize();
		GL.enableAlphaBlending();
		// this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.setTo(5);
		this.orbitalControl.lock(true);
		this._isPressing = false;

		this.mtxPerspective = mat4.create();	
		this.mtxPersp3 = mat3.create();	
	}


	_initControls() {
		const mtx = mat4.create();
		mat4.mul(mtx, this.camera.projection, this.camera.matrix);

		const s = 1;
		const points = [
			[-s,  s, 0],
			[ s,  s, 0],
			[ s, -s, 0],
			[-s, -s, 0]
		];


		const getPos = (p) => {
			return [
				(p[0] * .5 + .5) * GL.width,
				(p[1] * .5 + .5) * GL.height,
				0
			];
		}

		let pos = vec3.create();

		this._controls = document.body.querySelectorAll('.control-point');
		this._srcCorners = [];
		this._debugPoint = document.body.querySelector('.debug-point');

		this._controls.forEach( (point, i) => {


			let p = points[i];


			vec3.transformMat4(pos, p, mtx);
			p = getPos(pos);
			point.style.left = `${p[0]}px`;
			point.style.top = `${p[1]}px`;

			if(i === 2) {
				this._debugPos = p.concat();
				this._debugPosDistort = vec3.clone(this._debugPos);
			}

			const rect = point.getBoundingClientRect();
			this._srcCorners.push(rect.left, rect.top);


			point.pressed = false;

			point.addEventListener('mousedown', () => {
				point.pressed = true;
				this._isPressing = true;
			});

			window.addEventListener('mouseup', () => {
				point.pressed = false;
				this._isPressing = false;
			});

		});
		window.addEventListener('mousemove', e => {

			this._controls.forEach( point => {
				if(point.pressed) {
					point.style.left = `${e.clientX}px`;
					point.style.top = `${e.clientY}px`;
				}
			})
		});

		this._updateMatrix();
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
		// this._bSky = new alfrid.BatchSkybox();

		// this._vModel = new ViewObjModel();

		this.plane = alfrid.Geom.plane(2, 2, 1);
		this.shader = new alfrid.GLShader(vs);

	}

	_updateMatrix() {
		this._dstCorners = [];
		this._controls.forEach( (point, i) => {
			const rect = point.getBoundingClientRect();
			this._dstCorners.push(rect.left, rect.top);
		});

		const perspT = PerspT(this._srcCorners, this._dstCorners);

		const mtx = perspT.coeffs;
		mat3.copy(this.mtxPersp3, mtx);
		// mat4.copy(this.mtxPerspective, perspT.coeffs);
		// mat4.copy(this.mtxPerspective, perspT.coeffsInv);
		mat4.set(this.mtxPerspective, 
				mtx[0], mtx[1], 0, 		mtx[2],
				mtx[3], mtx[4], 0, 		mtx[5],
				0,      0,      mtx[8], 0,
				mtx[6], mtx[7], 0,      1
			)

		// vec3.transformMat3(this._debugPosDistort, this._debugPos, perspT.coeffsInv);

		const srcPt = perspT.transform(this._debugPos[0], this._debugPos[1]);

		console.table([
			[mtx[0], mtx[1], mtx[2]],
			[mtx[3], mtx[4], mtx[5]],
			[mtx[6], mtx[7], mtx[8]]
		]);



		this._debugPosDistort[0] = srcPt[0];
		this._debugPosDistort[1] = srcPt[1];
	}


	render() {
		if(!this._controls) { this._initControls(); }
		if(this._isPressing) { this._updateMatrix(); }


		GL.clear(0, 0, 0, 0);

		this._bAxis.draw();
		this._bDots.draw();

		this.shader.bind();
		this.shader.uniform("uPerspectiveMatrix", "mat4", this.mtxPerspective);
		GL.draw(this.plane);

		let s = 0.1;
		let v = vec3.fromValues(1, 1, 0);
		vec3.transformMat3(v, v, this.mtxPerspective);
		this._bBall.draw(v, [s, s, s], [1, 0, 0]);


		this._debugPoint.style.left = `${this._debugPosDistort[0]}px`;
		this._debugPoint.style.top = `${this._debugPosDistort[1]}px`;
	}


	resize() {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		GL.setSize(innerWidth, innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;