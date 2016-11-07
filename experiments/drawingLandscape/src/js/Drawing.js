// Drawing.js

import { Ray, EventDispatcher, GL } from 'alfrid';
import MathUtils from './MathUtils';


class Drawing extends EventDispatcher {
	constructor(mCamera, mMesh) {
		super();

		this.camera = mCamera;
		this.mesh = mMesh;

		window.addEventListener('mousedown', (e)=>this._onDown(e));
		window.addEventListener('mousemove', (e)=>this._onMove(e));
		window.addEventListener('mouseup', (e)=>this._onUp(e));

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
	}


	_onMove(e) {
		if(this._isLocked) return;
		if(!this._isMouseDown) return;

		const mx = (e.clientX / GL.width) * 2.0 - 1.0;
		const my = - (e.clientY / GL.height) * 2.0 + 1.0;

		this.camera.generateRay([mx, my, 0], this._ray);
		const mesh = this.mesh;
		const faceVertices = mesh.faces.map((face)=>(face.vertices));

		let hit;
		const offset = 0;
		let v0, v1, v2;

		for(let i = 0; i < faceVertices.length; i++) {
			const vertices = faceVertices[i];
			v0 = [vertices[0][0], vertices[0][1]+offset, vertices[0][2]];
			v1 = [vertices[1][0], vertices[1][1]+offset, vertices[1][2]];
			v2 = [vertices[2][0], vertices[2][1]+offset, vertices[2][2]];

			hit = this._ray.intersectTriangle(v0, v1, v2);
			if(hit) {	break;	}
		}

		if(hit) {
			const p = vec3.clone(hit);
			p[1] += Math.random();
			this._points.push(p);	
		}



		if(this._points.length > 3) {
			const numSeg = Math.min(this._points.length * 2.0, 60);
			this._bezierPoints = MathUtils.getBezierPoints(this._points, numSeg);
		} else {
			this._bezierPoints = [];
		}


		const bias = 0.001;
		this._bezierPoints = this._bezierPoints.map( (p, i)=> {
			return [ p[0], p[1]+bias*i, p[2]];
		});

		this.trigger('onMove', {points: this.points});
	}


	_onUp(e) {
		if(this._isLocked) return;
		this.trigger('onUp', {points: this.points});
		this._isMouseDown = false;

		this.trigger('mouseup', {});
	}


	get points() {	return this._bezierPoints;	}
}


export default Drawing;
