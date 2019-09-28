// ViewModel.js

import alfrid, { GL } from 'alfrid';

import Assets from './Assets';
import Config from './Config';

import { parse } from './helpers/GLTFParser';

import vs from 'shaders/model.vert';
import fs from 'shaders/model.frag';


class ViewModel extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		this.mtx = mat4.create();
		// this.mesh = Assets.get('model');
		this._isReady = false;


		const getMesh = (gltf) => {
			const nodes = gltf.nodes.filter( node => node.name !== 'Camera' && node.name !== 'Lamp');
			const rotation = quat.clone(nodes[0].rotation);
			mat4.fromQuat(this.mtx, rotation);
		}


		const addMesh = (id) => {
			let gltf = Assets.get(`${id}`);
			let bin = Assets.get(`${id}_bin`);

			parse(gltf, bin)
			.then( o => {
				this.mesh = o.output.meshes;
				getMesh(o);
				this._isReady = true;
			}, err => {
				console.log('Error :', err);
			});			
		}

		addMesh('scene');


		this.textureColorMap = Assets.get('Face_baseColor');
	}


	render() {
		if(!this.mesh) {
			return;
		}
		this.shader.bind();
		this.shader.uniform("uScale", "float", Config.modelScale);
		this.shader.uniform("texture", "uniform1i", 0);
		this.textureColorMap.bind(0);
		GL.draw(this.mesh);
	}

	isReady() {
		return this._isReady;
	}

}

export default ViewModel;