// HitDetect.js

import alfrid, { EventDispatcher, Ray } from 'alfrid';

class HitDetect extends EventDispatcher {
	constructor(gamepad, mesh) {
		super();
		this._gamepad = gamepad;
		this._mesh = mesh;
		this._mesh.generateFaces();
		this.faceVertices = mesh.faces.map((face)=>(face.vertices));

		this._isActivated = true;
		this._ray = new Ray([0, 0, 0], [0, 0, -1]);
		this._hit = vec3.fromValues(-999, -999, -999);
		this.mtxModel = mat4.create();

		alfrid.Scheduler.addEF(()=>this.update());
	}

	connect() {
		this._isActivated = true;
	}

	disconnect() {
		this._isActivated = false;
	}

	update() {
		vec3.copy(this._ray.origin, this._gamepad.position);
		vec3.copy(this._ray.direction, this._gamepad.dir);

		let hit;
		const v0 = vec3.create();
		const v1 = vec3.create();
		const v2 = vec3.create();
		let dist = 0;

		const getVector = (v, target) => {
			vec3.transformMat4(target, v, this.mtxModel);
		};

		for(let i = 0; i < this.faceVertices.length; i++) {
			const vertices = this.faceVertices[i];
			getVector(vertices[0], v0); 
			getVector(vertices[1], v1); 
			getVector(vertices[2], v2); 
			const t = this._ray.intersectTriangle(v0, v1, v2);

			if(t) {
				hit = vec3.clone(t);
			}
		}


		if(hit) {
			this._hit = vec3.clone(hit);
			this.dispatchCustomEvent('onHit', { hit });
		} else {
			this.dispatchCustomEvent('onUp');
		}
	}
}


export default HitDetect;