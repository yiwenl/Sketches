// ViewHead.js

import alfrid from './libs/alfrid.js';
let GL = alfrid.GL;
var glslify = require("glslify");

class ViewHead extends alfrid.View {
	
	constructor() {
		let fs = glslify('../shaders/pbr.frag');
		fs = fs.replace('{{NUM_PARTICLES}}', params.numParticles.toFixed(1));
		super(glslify('../shaders/pbr.vert'), fs);

		this.shaderWire = new alfrid.GLShader(alfrid.ShaderLibs.generalVert, alfrid.ShaderLibs.simpleColorFrag);
		this.shaderWire.bind();
		this.shaderWire.uniform("position", "uniform3fv", [0, -2.5, 0]);
		this.shaderWire.uniform("color", "uniform3fv", [1, 1, 1]);
		this.shaderWire.uniform("scale", "uniform3fv", [2.3, 2.3, 2.3]);
		this.shaderWire.uniform("opacity", "uniform1f", 1);

		this.isReady = false;
	}


	_init() {
		this._objLoader 	  = new alfrid.ObjLoader();
		this._objLoader.load('./assets/004.obj', (mesh)=>this._onObjLoaded(mesh), false);

		this._objLoader1 	  = new alfrid.ObjLoader();
		this._objLoader1.load('./assets/005.obj', (meshWire)=>this._onObjWireLoaded(meshWire), false, true, GL.LINES);
	}

	_onObjLoaded(mesh) {
		this.mesh = mesh;
		this.isReady = true;
	}

	_onObjWireLoaded(mesh) {
		// this.meshWire = mesh;
		let vertices = mesh._vertices;
		console.log(vertices.length);

		let positions = []
		let indices = [];
		let coords = [];
		let count = 0;

		for(let i=0; i<vertices.length; i+=3) {
			positions.push(vertices[i+0]);
			positions.push(vertices[i+1]);

			coords.push([0, 0]);
			coords.push([0, 0]);

			indices.push(count * 2 + 0);
			indices.push(count * 2 + 1);

			count ++;

			positions.push(vertices[i+1]);
			positions.push(vertices[i+2]);

			coords.push([0, 0]);
			coords.push([0, 0]);

			indices.push(count * 2 + 0);
			indices.push(count * 2 + 1);

			count ++;

			positions.push(vertices[i+2]);
			positions.push(vertices[i+0]);

			coords.push([0, 0]);
			coords.push([0, 0]);

			indices.push(count * 2 + 0);
			indices.push(count * 2 + 1);

			count ++;
		}


		this.meshWire = new alfrid.Mesh(GL.LINES);
		this.meshWire.bufferVertex(positions);
		this.meshWire.bufferTexCoords(coords);
		this.meshWire.bufferIndices(indices);
	}

	render(textureRad, textureIrr, textureAO) {
		if(!this.mesh) {
			return;
		}

		if(params.showWires) {
			this.shaderWire.bind();
			GL.draw(this.meshWire);
			return;
		}

		this.shader.bind();
		this.shader.uniform("uAoMap", "uniform1i", 0);
		this.shader.uniform("uRadianceMap", "uniform1i", 1);
		this.shader.uniform("uIrradianceMap", "uniform1i", 2);
		textureAO.bind(0);
		textureRad.bind(1);
		textureIrr.bind(2);

		let roughness4 = Math.pow(params.roughness, 4.0);
		this.shader.uniform("uBaseColor", "uniform3fv", [1, 1, 1]);
		this.shader.uniform("uRoughness", "uniform1f", params.roughness);
		this.shader.uniform("uRoughness4", "uniform1f", roughness4);
		this.shader.uniform("uMetallic", "uniform1f", params.metallic);
		this.shader.uniform("uSpecular", "uniform1f", params.specular);

		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);
		GL.draw(this.mesh);
	}


}

export default ViewHead;