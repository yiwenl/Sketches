// ViewTree.js

import alfrid from 'alfrid';
let GL = alfrid.GL;
const vs = require('../shaders/pbr.vert');
const fs = require('../shaders/envLight.frag');

class ViewTree extends alfrid.View {
	
	constructor() {
		super(vs, fs);
		this.roughness = .9;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [50/255, 25/255, 25/255];
		this.position = [0, 0, 0];
		this.scale = [1, 1, 1];
	}


	_init() {
		this._objLoader 	  = new alfrid.ObjLoader();
		this._objLoader.load('./assets/tree.obj', (mesh)=>this._onObjLoaded(mesh), false);
	}

	_onObjLoaded(mesh) {
		this.mesh = mesh;
		const minY = 0.65;

		this._vertices = [];
		for(let i=0; i<this.mesh.vertices.length; i++) {
			let v = this.mesh.vertices[i];
			if(v[1] > minY) {
				this._vertices.push(v);
			}
		}

		console.log(this._vertices.length, this.mesh.vertices.length);
		// gui.add(this, 'roughness', 0, 1);
		// gui.add(this, 'specular', 0, 1);
		// gui.add(this, 'metallic', 0, 1);

		this.shader.bind();

		this.shader.uniform("uAoMap", "uniform1i", 0);
		this.shader.uniform("texture", "uniform1i", 1);
		this.shader.uniform("textureNext", "uniform1i", 2);
		this.shader.uniform("uBaseColor", "uniform3fv", this.baseColor);

		this.shader.uniform("uPosition", "vec3", this.position);
		this.shader.uniform("uScale", "vec3", this.scale);
		

		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);
	}


	get vertices() {
		return this._vertices;
	}


	render(texture, textureNext, textureAO) {
		if(!this.mesh) {
			return;
		}

		this.shader.bind();
		textureAO.bind(0);
		texture.bind(1);
		textureNext.bind(2);
			
		this.shader.uniform("offset", "float", params.offset);
		// this.shader.uniform("uRoughness", "uniform1f", this.roughness);
		// this.shader.uniform("uMetallic", "uniform1f", this.metallic);
		// this.shader.uniform("uSpecular", "uniform1f", this.specular);

		GL.draw(this.mesh);
	}


}

export default ViewTree;