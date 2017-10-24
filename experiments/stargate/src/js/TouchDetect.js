// TouchDetect.js

import alfrid, { GL, Ray } from 'alfrid';
import distance from './utils/distance';
import vs from 'shaders/debugTouch.vert';

function getMouse(e) {
	if(e.touches) {
		return {
			x:e.touches[0].pageX,
			y:e.touches[0].pageY,
		}
	} else {
		return {
			x:e.clientX,
			y:e.clientY
		}
	}
}

class TouchDetect extends alfrid.EventDispatcher {
	constructor(mCamera) {
		super();
		this.camera = mCamera;
		this.shader = new alfrid.GLShader(vs);

		const s = 5;
		this.mesh = new alfrid.Geom.plane(s, s, 1, 'xy');
		this.mesh.generateFaces();
		this.faceVertices = this.mesh.faces.map((face)=>(face.vertices));
		// alfrid.Scheduler.addEF(()=>this.update());

		const positions = this.mesh.getAttribute('aVertexPosition').source;

		console.log("Positions", positions);

		this._ray = new Ray([0, 0, 0], [0, 0, -1]);
		this._vDir = vec3.create();


		window.addEventListener('mousedown', (e)=>this._onDown(e));
		window.addEventListener('mouseup', (e)=>this._onUp(e));
	}


	_onDown(e) {
		this._pointDown = getMouse(e);
	}


	_onUp(e) {
		this._pointUp = getMouse(e);

		let dist = distance(this._pointDown, this._pointUp);
		if(dist > 1) {
			return;
		}


		const mx = (this._pointUp.x / GL.width) * 2.0 - 1.0;
		const my = - (this._pointUp.y / GL.height) * 2.0 + 1.0;
		this.camera.generateRay([mx, my, 0], this._ray);
		let hit;
		const { faceVertices } = this;
		const m = GL._inverseModelViewMatrix;

		function rotate(vec) {
			const v = vec3.clone(vec);
			vec3.transformMat3(v, v, m);
			return v;
		}

		let v0, v1, v2;

		for(let i = 0; i < faceVertices.length; i++) {
			const vertices = faceVertices[i];
			v0 = rotate(vertices[0]);
			v1 = rotate(vertices[1]);
			v2 = rotate(vertices[2]);

			hit = this._ray.intersectTriangle(v0, v1, v2);
			if(hit) {	break;	}
		}

		if(hit) {
			vec3.sub(this._vDir, hit, this.camera.position);
			vec3.normalize(this._vDir, this._vDir);

			this.dispatchCustomEvent('onTouch', {
				position:hit,
				direction:this._vDir
			});
		}
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}
}


export default TouchDetect;