// ViewBlocks.js


import alfrid, { GL } from 'alfrid';
import vs from '../shaders/blocks.vert';
import fs from '../shaders/blocks.frag';

var random = function(min, max) { return min + Math.random() * (max - min);	}

class ViewBlocks extends alfrid.View {
	
	constructor() {
		super(vs, fs);

		this._needUpdate = 0;
	}

	_init() {
		this.meshCubes = alfrid.Geom.cube(1, 1, 1);
		// this.meshSphere = alfrid.Geom.sphere(1, 24);
		this.meshSphere = alfrid.Geom.cube(1, 1, 1);

		this._positionCubes = [];
		this._positionSpheres = [];
		this._extraCubes = [];
		this._extraSpheres = [];

		const r = params.floorSize/2;

		function getPos() {
			return [-999, -999, -999];
		}

		const scale = 0.5;

		for(let i=0; i<params.numItems; i++) {
			this._positionSpheres.push(getPos());
			this._positionCubes.push(getPos());

			this._extraCubes.push([random(.1, .05) * scale, Math.random() * Math.PI, Math.random() * Math.PI]);
			this._extraSpheres.push([random(.1, .05) * scale, Math.random() * Math.PI, Math.random() * Math.PI]);
		}


		this.meshCubes.bufferInstance(this._positionCubes, 'aPosOffset');
		this.meshSphere.bufferInstance(this._positionSpheres, 'aPosOffset');
		this.meshCubes.bufferInstance(this._extraCubes, 'aExtra');
		this.meshSphere.bufferInstance(this._extraSpheres, 'aExtra');


		this._positionReset = this._positionCubes.concat();


		this.roughness = 1;
		this.specular = 1.0;
		this.metallic = 0;
		this.baseColor = [1, 1, 1];
		
		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'metallic', 0, 1);
	}


	addBlock(mPos, mIsCube) {
		if(mIsCube) {
			this._needUpdate = 1;
			this._positionCubes.push(mPos);
			this._positionCubes.shift();

			const extra = this._extraCubes.shift();
			this._extraCubes.push(extra);
		} else {
			this._needUpdate = 2;
			this._positionSpheres.push(mPos);
			this._positionSpheres.shift();

			const extra = this._extraSpheres.shift();
			this._extraSpheres.push(extra);
		}
	}


	_updateMesh() {
		if(this._needUpdate == 1) {
			this.meshCubes.bufferInstance(this._positionCubes, 'aPosOffset');	
			this.meshCubes.bufferInstance(this._extraCubes, 'aExtra');
		} else {
			this.meshSphere.bufferInstance(this._positionSpheres, 'aPosOffset');	
			this.meshSphere.bufferInstance(this._extraSpheres, 'aExtra');
		}
		
		this._needUpdate = 0;
	}


	reset() {
		this.meshCubes.bufferInstance(this._positionReset, 'aPosOffset');
		this.meshSphere.bufferInstance(this._positionReset, 'aPosOffset');

		this._positionCubes = this._positionReset.concat();
		this._positionSpheres = this._positionReset.concat();
	}


	render(textureRad, textureIrr) {

		if(this._needUpdate > 0) {
			this._updateMesh();
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


		GL.draw(this.meshCubes);

		const g = .1;
		this.shader.uniform("uBaseColor", "vec3", [g, g, g]);
		this.shader.uniform('uRoughness', 'uniform1f', 0.75);
		this.shader.uniform('uMetallic', 'uniform1f', 0.25);
		this.shader.uniform('uSpecular', 'uniform1f', 1.0);
		GL.draw(this.meshSphere);
	}


}

export default ViewBlocks;