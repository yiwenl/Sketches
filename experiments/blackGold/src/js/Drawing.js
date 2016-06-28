// Drawing.js

import { Ray, EventDispatcher, GL } from 'alfrid';
import MathUtils from './MathUtils';

function getMouse(e) {
	if(e.touches) {
		return {x:e.touches[0].pageX, y:e.touches[0].pageY};
	} else {
		return {x:e.clientX, y:e.clientY};
	}
}


class Drawing extends EventDispatcher {
	constructor(mCamera, mMesh) {
		super();

		this.camera = mCamera;
		this.mesh = mMesh;
		this.bias = vec3.create();

		window.addEventListener('mousedown', (e)=>this._onDown(e));
		window.addEventListener('touchstart', (e)=>this._onDown(e));
		window.addEventListener('mousemove', (e)=>this._onMove(e));
		window.addEventListener('touchmove', (e)=>{
			e.preventDefault();
			this._onMove(e);
		});
		window.addEventListener('mouseup', (e)=>this._onUp(e));
		window.addEventListener('touchend', ()=>this._onUp());

		this._isLocked = true;
		this._isMouseDown = false;
		this._ray = new Ray([0, 0, 0], [0, 0, -1]);
		this._points = [];
		this._bezierPoints = [];
	}


	lock(mValue) {
		this._isLocked = mValue;
	}


	clear() {
		this._points = [];
		this._bezierPoints = [];
	}


	_onDown(e) {
		if(this._isLocked) return;
		this._isMouseDown = true;
		this.trigger('onDown', {});
	}


	_onMove(e) {
		if(this._isLocked) return;
		if(!this._isMouseDown) return;

		const o = getMouse(e);

		const mx = (o.x / GL.width) * 2.0 - 1.0;
		const my = - (o.y / GL.height) * 2.0 + 1.0;

		this.camera.generateRay([mx, my, 0], this._ray);
		const mesh = this.mesh;

		// this.meshes.map((mesh) => {
		const faceVertices = mesh.faces.map((face)=>(face.vertices));

		let hit;
		const offset = 1.01;
		let v0, v1, v2;
		// const m = mat4.create();
		const v = vec3.create();
		const m = GL._inverseModelViewMatrix;

		function rotate(vec) {
			vec3.copy(v, vec);
			v[2] += 1.75;
			vec3.transformMat3(v, v, m);
			return vec3.clone(v);
		}

		for(let i = 0; i < faceVertices.length; i++) {
			const vertices = faceVertices[i];
			// v0 = [vertices[0][0]*offset, vertices[0][1]*offset, vertices[0][2]*offset];

			v0 = rotate(vertices[0]);
			// v1 = [vertices[1][0]*offset, vertices[1][1]*offset, vertices[1][2]*offset];

			v1 = rotate(vertices[1]);
			// v2 = [vertices[2][0]*offset, vertices[2][1]*offset, vertices[2][2]*offset];

			v2 = rotate(vertices[2]);

			hit = this._ray.intersectTriangle(v0, v1, v2);
			if(hit) {	break;	}
		}

		if(hit) {
			this._points.push(vec3.clone(hit));	
		}

		if(this._points.length > 3) {
			const numSeg = this._points.length;
			this._bezierPoints = MathUtils.getBezierPoints(this._points, numSeg);
		} else {
			this._bezierPoints = [];
		}

		this._bezierPoints = this._bezierPoints.map( (p, i)=> {
			return [ p[0], p[1], p[2]];
		});

		this.trigger('onMove', {points: this.points});
	}


	_onUp(e) {
		if(this._isLocked) return;
		this._isMouseDown = false;

		if(!GL.isMobile) {
			this.trigger('onUp', {points: this.points});
		}
		
	}


	get points() {	return this._bezierPoints;	}
}


export default Drawing;
