// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import ViewMask from './ViewMask';
import Assets from './Assets';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;

		//	CAMERA CUBE
		this.cameraCube = new alfrid.CameraCube();

		this.count = 0;

		this._initBalls();
	}

	_initTextures() {
		console.log('init textures');

		let fboSize        = 64 * 8;
		this._cubeFbo      = new alfrid.CubeFrameBuffer(fboSize);
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		// this._bAxis = new alfrid.BatchAxis();
		// this._bDots = new alfrid.BatchDotsPlane();
		this._bSky = new alfrid.BatchSkybox();
		this._bBall = new alfrid.BatchBall();

		this._vMask = new ViewMask();
	}


	_initBalls() {
		const numBalls = 6;
		const m = mat4.create();

		function getPos() {
			let v = vec3.fromValues(0, 0, -random(5, 10));
			mat4.identity(m, m);
			mat4.rotateX(m, m, Math.random() * Math.PI * 2);
			mat4.rotateY(m, m, Math.random() * Math.PI * 2);
			mat4.rotateZ(m, m, Math.random() * Math.PI * 2);
			vec3.transformMat4(v, v, m);

			return v;
		}

		this._balls = [];
		for(let i=0; i<numBalls; i++) {
			const pos = getPos();
			const scale = random(1, 5) * 0.5;
			this._balls.push({
				pos,
				scale
			});
		}

	}


	_getCubeMap() {
		if(this.count++ % 2 == 0) {
			GL.setMatrices(this.cameraCube);
			for(var i=0; i<6; i++) {
				this._cubeFbo.bind(i);
				GL.clear(0, 0, 0, 0);
				this.cameraCube.face(i);
				

				this._balls.forEach((ball)=> {
					const {pos, scale} = ball;
					this._bBall.draw(pos, [scale, scale, scale], [1, 1, 0], 1);
				});

				this._cubeFbo.unbind();
			}
		}
		
	}


	render() {
		this._getCubeMap();

		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.camera);

		this._bSky.draw(this._cubeFbo.getTexture());

		this._vMask.render(Assets.get('studio_radiance'), Assets.get('irr'), this._cubeFbo.getTexture());
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;