// TouchDetect.js

import alfrid, { EventDispatcher, Ray, GL } from 'alfrid';

let v0, v1, v2;

class TouchDetect extends EventDispatcher {
	constructor(mesh, camera, listenerTarget=window) {
		super();
		this._mesh = mesh;
		this._camera = camera;


		this._isMouseDown = false;
		this._listenerTarget = listenerTarget;
		this._ray = new Ray([0, 0, 0], [0, 0, -1]);
		this._hit = vec3.fromValues(-999, -999, -999);
		this._count = 0;

		mesh.generateFaces();
		this._faceVertices = mesh.faces.map((face)=>(face.vertices));

		this._initEvents();
	}


	_initEvents() {
		this._listenerTarget.addEventListener('mousedown', ()=>this._onDown());
		this._listenerTarget.addEventListener('mouseup', ()=>this._onUp());
		this._listenerTarget.addEventListener('mousemove', (e)=>this._onMove(e));
	}


	_onDown(e) {
		this._isMouseDown = true;
		this.trigger('down');
	}


	_onUp(e) {
		this._isMouseDown = false;
		this.trigger('up');
	}


	_onMove(e) {
		if(this._count ++ % 3 !== 0) {
			return;
		}
		const mx = (e.clientX / window.innerWidth) * 2.0 - 1.0;
		const my = - (e.clientY / window.innerHeight) * 2.0 + 1.0;

		this._camera.generateRay([mx, my, 0], this._ray);

		let hit;
		const offset = 0;
		
		const faceVertices = this._faceVertices;

		for(let i = 0; i < faceVertices.length; i++) {
			const vertices = faceVertices[i];
			v0 = [vertices[0][0], vertices[0][1]+offset, vertices[0][2]];
			v1 = [vertices[1][0], vertices[1][1]+offset, vertices[1][2]];
			v2 = [vertices[2][0], vertices[2][1]+offset, vertices[2][2]];

			hit = this._ray.intersectTriangle(v0, v1, v2);
			if(hit) {	break;	}
		}

		if(!hit) {
			hit = [-999, -999, -999];
		} 
		vec3.copy(this._hit, hit);
	}



	get isMouseDown() {
		return this._isMouseDown;
	}

	get hit() {
		return this._hit;
	}
}


export default TouchDetect;