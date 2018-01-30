// MarchingLine.js

import { EventDispatcher } from 'alfrid';
var random = function(min, max) { return min + Math.random() * (max - min);	}

const front = vec3.fromValues(0, 0, -1);

class MarchingLine extends EventDispatcher {
	constructor(mInitPoint, mAxis) {
		super();
		this._point = mInitPoint;
		this._axis = mAxis;
		this._dir = Math.random() > .5 ? 1 : -1;
		this._init();
	}

	_init() {
		if(!this._point) {
			this._point = vec3.fromValues(random(-1, 1), random(-1, 1), random(-1, 1));
			vec3.normalize(this._point, this._point);
			vec3.scale(this._point, this._point, params.radius);	
		}
		

		this._rotation = quat.create();
		this._angle = 0;
		if(!this._axis) {
			this._axis = vec3.create();

			/*/
			this._axis = vec3.fromValues(random(-1, 1), random(-1, 1), random(-1, 1));
			vec3.normalize(this._axis, this._axis);
			/*/
			
			const t = vec3.create();
			vec3.cross(t, this._point, front);
			const m = mat4.create();
			mat4.rotate(m, m, Math.PI * 0.5, t);
			vec3.transformMat4(this._axis, this._point, m);
			//*/
		}

		quat.setAxisAngle(this._rotation, this._axis, this._angle);
		
		this._hasHit = false;
		this._points = [];
	}

	march(allPoints) {

		if(this._hasHit) {
			return;
		}
		
		this._angle += 0.01 * this._dir;
		quat.setAxisAngle(this._rotation, this._axis, this._angle);

		const p = vec3.clone(this._point);
		vec3.transformQuat(p, p, this._rotation);
		let d = 0.0;


		allPoints.forEach( pp => {
			d = vec3.dist(p, pp);
			if(d < params.minDist) {
				this._hasHit = true;
				//	dispatch event
				this._spawnPoints();
				return;
			}
		});


		this._points.push(p);
	}


	_spawnPoints() {
		const total = this._points.length;
		if(total < 20) {
			return;
		}

		const offset = 0.25;
		let i0 = Math.round(random(offset, 0.5) * total);
		let i1 = Math.round(random(1.0 - offset, 0.5) * total);
		let p0 = this._points[i0];
		let p1 = this._points[i1];

		const t = vec3.create();
		vec3.cross(t, this._axis, front);
		vec3.normalize(t, t);
		const m = mat4.create();
		mat4.rotate(m, m, Math.PI * 0.5, t);
		const axis = vec3.create();
		vec3.transformMat4(axis, this._axis, m);

		const lines = [
			new MarchingLine(p0, axis),
			new MarchingLine(p1, axis)
		]


		this.trigger('onHit', {p0, p1, lines});
	}


	get points() {
		return this._points;
	}
}


export default MarchingLine;