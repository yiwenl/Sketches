// hitTest.js

import alfrid, { GL, Ray } from 'alfrid';

let faceVertices;
const ray = new Ray([0, 0, 0], [0, 0, -1]);
const mtxModel = mat4.create();

const hitTest = (pos, mesh, camera) => {
	


	if(!faceVertices) {
		mesh.generateFaces();
		faceVertices = mesh.faces.map((face)=>(face.vertices));	
	}
	


	const mx = (pos.x / GL.width) * 2.0 - 1.0;
	const my = - (pos.y / GL.height) * 2.0 + 1.0;

	camera.generateRay([mx, my, 0], ray	);

	let hit;
	const v0 = vec3.create();
	const v1 = vec3.create();
	const v2 = vec3.create();
	let dist = 0;

	const getVector = (v, target) => {
		vec3.transformMat4(target, v, mtxModel);
	};

	for(let i = 0; i < faceVertices.length; i++) {
		const vertices = faceVertices[i];
		getVector(vertices[0], v0); 
		getVector(vertices[1], v1); 
		getVector(vertices[2], v2); 
		const t = ray.intersectTriangle(v0, v1, v2);

		if(t) {
			if(hit) {
				const distToCam = vec3.dist(t, camera.position);
				if(distToCam < dist) {
					hit = vec3.clone(t);
					dist = distToCam;
				}
			} else {
				hit = vec3.clone(t);
				dist = vec3.dist(hit, camera.position);
			}	
		}
	}


	if(hit) {
		// this._hit = vec3.clone(hit);
		// this.dispatchCustomEvent(mType, { hit });
		return hit;
	} else {
		// this.dispatchCustomEvent('onUp');
		return null;
	}
}


export { hitTest };