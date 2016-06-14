// ViewWalls.js

import alfrid, { GL } from 'alfrid';
import vs from '../shaders/pbr.vert';
import fs from '../shaders/pbr.frag';

const BOX_WIDTH = 0.1;
const BOX_DEPTH = 0.025;
const STARTING_RADIUS = 0.5;
const INDEX_INCREASE = 24;
const RADIUS_INCREASE = 0.15;
const mtx = mat4.create();

const NUM_MESHES = 2;

class ViewWalls extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.radius = STARTING_RADIUS;
		this.angle = 0;

		this.mesh = new alfrid.Mesh(GL.TRIANGLES);
		this.meshCube = alfrid.Geom.cube(BOX_WIDTH, 1, BOX_DEPTH);
		this._verticesCube = this.meshCube.vertices;
		this._normalsCube = this.meshCube.normals;
		this._indicesCube = this.meshCube._indices;

		this.roughness = .9;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];

		this.meshes = [];
		// this.meshes.push(this.mesh);

		this.positions = [];
		this.coords = [];
		this.indices = [];
		this.normals = [];
		this.count = 0;


		this._hasStarted = false;

		while(this.meshes.length < NUM_MESHES) {
			this.addWall();
		}
	}


	addWall(mAmp=1) {
		if(this.count >= 1000) {
			const mesh = new alfrid.Mesh(GL.TRIANGLES);
			mesh.bufferVertex(this.positions);
			mesh.bufferTexCoord(this.coords);
			mesh.bufferNormal(this.normals);
			mesh.bufferIndex(this.indices);

			this.positions = [];
			this.coords = [];
			this.indices = [];
			this.normals = [];
			this.count = 0;

			// this.mesh = new alfrid.Mesh(GL.TRIANGLES);
			this.meshes.push(mesh);
			console.log('Add MESH', this.meshes, mesh.vertices.length);
		}

		let cx = Math.cos(this.angle) * this.radius;
		let cz = Math.sin(this.angle) * this.radius;

		function rotate(v, angle) {
			let newV = vec3.create();
			mat4.identity(mtx, mtx);
			mat4.rotateY(mtx, mtx, angle);
			vec3.transformMat4(newV, v, mtx);
			return newV;
		}


		function getPos(v, angle, height) {
			let h = height;
			let newV = rotate(v, angle);
			let y = newV[1] * h + h/2;
			return [newV[0]+cx, y, newV[2]+cz];
		}

		let angle = -this.angle + Math.PI/2;

		for(let i=0; i<this._verticesCube.length; i++) {
			this.positions.push(getPos(this._verticesCube[i], angle, mAmp));
			this.normals.push(rotate(this._normalsCube[i], angle));
			this.coords.push([this.radius, this.angle]);
		}

		for(let i=0; i<this._indicesCube.length; i++) {
			this.indices.push(this.count * INDEX_INCREASE + this._indicesCube[i]);
		}


		
		const lengthCircle = Math.PI * 2 * this.radius;
		const numCubes = lengthCircle/(BOX_WIDTH+0.05);
		const angleIncrease = Math.PI * 2.0 / numCubes;
		this.angle += angleIncrease;
		const radiusIncrease = RADIUS_INCREASE / numCubes;
		this.radius += radiusIncrease;
		this.count ++;
	}


	render(textureRad, textureIrr) {
		if(!this.meshes) {
			return;
		}

		this.shader.bind();

		this.shader.uniform('uRadianceMap', 'uniform1i', 0);
		this.shader.uniform('uIrradianceMap', 'uniform1i', 1);
		textureRad.bind(0);
		textureIrr.bind(1);

		this.shader.uniform('uBaseColor', 'uniform3fv', this.baseColor);
		this.shader.uniform('uRoughness', 'uniform1f', this.roughness);
		this.shader.uniform('uMetallic', 'uniform1f', this.metallic);
		this.shader.uniform('uSpecular', 'uniform1f', this.specular);

		this.shader.uniform('uExposure', 'uniform1f', params.exposure);
		this.shader.uniform('uGamma', 'uniform1f', params.gamma);


		GL.draw(this.meshes);
	}

}

export default ViewWalls;