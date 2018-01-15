// HitDetector.js

import alfrid, { Scene, GL, TouchDetector } from 'alfrid';

class HitDetector extends alfrid.EventDispatcher {
	constructor(camera, modelMatrix) {
		super();
		this._camera = camera;
		this._modelMatrix = mat4.clone(modelMatrix);
		const mtx = mat4.create();
		const h = 6;
		mat4.translate(mtx, mtx, vec3.fromValues(0, h, 0));
		mat4.multiply(this._modelMatrix, this._modelMatrix, mtx);
		this._mesh = alfrid.Geom.cube(3, h*2, 3);
		this.shader = new alfrid.GLShader();

		this._bBall = new alfrid.BatchBall();
		this._detector = new TouchDetector(this._mesh, this._camera);
		mat4.copy(this._detector.mtxModel, this._modelMatrix);
		this._hit = vec3.fromValues(999, 999, 999);
		this._detector.on('onHit', (e)=> {
			vec3.copy(this._hit, e.detail.hit);
			this._hit[1] += h;
		});

		this._detector.on('onUp', ()=> {
			vec3.set(this._hit, 999, 999, 999);
		});
	}


	debug() {
		const s = .05;
		this._bBall.draw(this._hit, [s, s, s], [.8, 0, 0]);
	}


	get hit() {
		return this._hit;
	}
}


export default HitDetector;