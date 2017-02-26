// VIVEGamePads.js


import { Scheduler, Ray, EventDispatcher, GL } from 'alfrid';
import VIVEUtils from './VIVEUtils';
import State from './State';
import MathUtils from './MathUtils';

const V_FRONT = vec3.fromValues(0, 0, -1);

class VIVEGamePads extends EventDispatcher {
	constructor(mMesh, mModelMatrix) {
		super();

		this._mesh = mMesh;
		this._invertModelMatrix = mat4.clone(mModelMatrix);
		mat4.invert(this._invertModelMatrix, this._invertModelMatrix);
		this._ray = new Ray([0, 0, 0], [0, 0, 1]);
		this._isDrawing = false;
		this._quat = quat.create();

		this._vDir = vec3.fromValues(0, 0, -1);
		this._vPos = vec3.create();
		this._vTarget = vec3.create();
		this._vHit = vec3.create();
		this._hasHit = false;

		this._points = [];
		this._bezierPoints = [];

		this._faceVertices = this._mesh.faces.map((face)=>(face.vertices));

/*
		for(let i = 0; i < this._faceVertices.length; i++) {
			let vertices = this._faceVertices[i];
			vertices = vertices.map((v)=> {
				vec3.transformMat4(v, v, this._invertModelMatrix);
				return v;
			});

			this._faceVertices[i] = vertices;
		}
*/


		const oButtonState = {
			button0:false,
			button1:false,
			button2:false,
			button3:false
		}

		this._buttonState = new State(oButtonState);
		this._buttonState.on('changed', (o)=>this._onButtonStateChanged(o.detail));

		Scheduler.addEF(()=>this._loop());
	}


	setModelMatrix(mModelMatrix) {
		console.debug('Setting new model matrix');
		this._invertModelMatrix = mat4.clone(mModelMatrix);
		mat4.invert(this._invertModelMatrix, this._invertModelMatrix);
	}

	_onButtonStateChanged(o) {
		if(o.changed.button0 !== undefined) {
			this._isDrawing = o.changed.button0;

			if(!this._isDrawing) {
				this.trigger('onUp', {points: this.points});
			} else {
				this.clear();
				this.trigger('onDown');
			}
		} else {
			this._isDrawing = false;
		}


		if(o.changed.button1 !== undefined) {
			if(!o.changed.button1) {
				this.trigger('clear');
			}
		}
		
	}

	_loop() {
		let _gamePads = VIVEUtils.gamePads;

		if(_gamePads.length == 0) { return; }

		if(_gamePads.length > 0) {
			let gamepad = _gamePads[0];

			const newState = {};
			for(let i=0; i<gamepad.buttons.length; i++) {
				newState[`button${i}`] = (gamepad.buttons[i].pressed);
			}

			this._buttonState.setState(newState);

			vec3.copy(this._vPos, gamepad.position);
			vec3.transformMat4(this._vPos, this._vPos, this._invertModelMatrix);

			quat.copy(this._quat, gamepad.orientation);
			vec3.transformQuat(this._vDir, V_FRONT, gamepad.orientation);

			this._ray = new Ray(this._vPos, this._vDir);

			vec3.scale(this._vDir, this._vDir, 5);
			vec3.add(this._vTarget, this._vDir, this._vPos);


			let hit;
			let v0, v1, v2;

			for(let i = 0; i < this._faceVertices.length; i++) {
				const vertices = this._faceVertices[i];
				v0 = [vertices[0][0], vertices[0][1], vertices[0][2]];
				v1 = [vertices[1][0], vertices[1][1], vertices[1][2]];
				v2 = [vertices[2][0], vertices[2][1], vertices[2][2]];

				hit = this._ray.intersectTriangle(v0, v1, v2);
				if(hit) {	break;	}
			}


			let needToUpdate = false;
			const minDist = 0.5;

			if(hit) {
				this._hasHit = true;
				vec3.copy(this._vHit, hit);
			} else {
				this._hasHit = false;
				vec3.copy(this._vHit, this._vTarget);
			}


		}
	}

	clear() {
		this._points = [];
		this._bezierPoints = [];
	}


	get position() {
		return this._vPos;
	}


	get direction() {
		return this._vTarget;
	}


	get hit() {
		return this._vHit;
	}


	get hasHit() {
		return this._hasHit;
	}

	get points() {	return this._bezierPoints;	}


	get quat() {	return this._quat;	}


	get isButtonPressed() {
		return this._isDrawing;
	}

}


export default VIVEGamePads;