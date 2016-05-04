// ViewObjModel.js

import alfrid from 'alfrid';
let GL = alfrid.GL;
let vs = require('../shaders/pbr.vert');
let fs = require('../shaders/pbr.frag');

class ViewObjModel extends alfrid.View {
	
	constructor() {
		vs = vs.replace('{NUM_DROPS}', params.numDrops);
		fs = fs.replace('{NUM_DROPS}', params.numDrops);

		super(vs, fs);
		this.roughness = .92;
		this.specular = 0;
		this.metallic = 0;
		this.baseColor = [5, 15, 34];
		this.normalScale = .5;
		this._needUpdate = true;

		this.identityMatrix = mat4.create();
		this.drops = [];
	}


	_init() {
		this._objLoader 	  = new alfrid.ObjLoader();
		this._objLoader.load('./assets/model.obj', (mesh)=>this._onObjLoaded(mesh), false);

		function getAsset(id) {
			for(var i=0; i<assets.length; i++) {
				if(id === assets[i].id) {
					return assets[i].file;
				}
			}
		}

		let o = {
			wrapS:GL.gl.CLAMP_TO_EDGE,
			wrapT:GL.gl.CLAMP_TO_EDGE
		}
		this._textureGold = new alfrid.GLTexture(getAsset('gold'), false, o);
		this._textureDrop = new alfrid.GLTexture(getAsset('drop'), false, o);
	}


	addDrop(pos=[5, 2, 5]) {
		let cameraDrop = new alfrid.CameraPerspective();
		cameraDrop.setPerspective(Math.PI * .2, 1, 0.1, 20);
		let dropMatrix = mat4.create();
		cameraDrop.lookAt(pos, vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));
		mat4.multiply(dropMatrix, cameraDrop.projection, cameraDrop.viewMatrix);

		this.drops.push(dropMatrix);
		if(this.drops.length > params.numDrops) this.drops.shift();
		this._needUpdate = true;
	}


	_onObjLoaded(mesh) {
		this.mesh = mesh;
		/*
		gui.add(this, 'roughness', 0, 1);
		gui.add(this, 'specular', 0, 1);
		gui.add(this, 'metallic', 0, 1);
		gui.add(this, 'normalScale', 0, 1);
		gui.addColor(this, 'baseColor');
		*/

		this.shader.bind();
		this.shader.uniform("uAoMap", "uniform1i", 0);
		this.shader.uniform("uGoldMap", "uniform1i", 1);
		this.shader.uniform("uDropMap", "uniform1i", 2);
		this.shader.uniform("uRadianceMap", "uniform1i", 3);
		this.shader.uniform("uIrradianceMap", "uniform1i", 4);

		let color = [this.baseColor[0]/255, this.baseColor[1]/255, this.baseColor[2]/255];
		this.shader.uniform("uBaseColor", "uniform3fv", color);
		this.shader.uniform("uRoughness", "uniform1f", this.roughness);
		this.shader.uniform("uMetallic", "uniform1f", this.metallic);
		this.shader.uniform("uSpecular", "uniform1f", this.specular);

		this.shader.uniform("uExposure", "uniform1f", params.exposure);
		this.shader.uniform("uGamma", "uniform1f", params.gamma);
		this.shader.uniform("uNormalScale", "uniform1f", this.normalScale);
	}


	render(textureRad, textureIrr, textureAO) {
		if(!this.mesh) {
			return;
		}

		
		this.shader.bind();
		textureAO.bind(0);
		this._textureGold.bind(1);
		this._textureDrop.bind(2);
		textureRad.bind(3);
		textureIrr.bind(4);

		
		if(this._needUpdate) {
			let dropMatrices = [];

			for(let i=0; i<params.numDrops; i++) {
				let mtx = this.drops[i] || this.identityMatrix;
				for(let j=0; j<mtx.length; j++) {
					dropMatrices.push(mtx[j]);
				}
			}

			this.shader.uniform("uDropMatrices", "uniformMatrix4fv", dropMatrices);
			this.shader.uniform("numPaints", "float", this.drops.length);
			this._needUpdate = false;
		}
		

		GL.draw(this.mesh);
	}


}

export default ViewObjModel;