// ViewDae.js

import alfrid, { GL } from 'alfrid';
import ColladaParser from './ColladaParser';
import Assets from './Assets';
import vs from 'shaders/testboard.vert';
import fs from 'shaders/testboard.frag';

class ViewDae extends alfrid.View {
	
	constructor() {
		super(vs, fs);
	}


	_init() {
		const mtx = mat4.create();
		const s = 0.0015;
		mat4.translate(mtx, mtx, vec3.fromValues(0, 0.1, 0));
		mat4.scale(mtx, mtx, vec3.fromValues(s, s, s));
		mat4.rotateY(mtx, mtx, -Math.PI/2);
		mat4.rotateX(mtx, mtx, -.3);
		this.mesh = ColladaParser.parse(Assets.get('boatTest'), mtx);

		const patt = /\/.+\./;
		const pattClear = /(\/|\.)/g;

		this.mesh.forEach((m)=> {
			if(m.material.diffuseMapID) {
				const o = patt.exec(m.material.diffuseMapID);
				const id = o[0].replace(pattClear, '');

				if(Assets.get(id)) {
					m.texture = Assets.get(id);
				}
			}
		});
	}


	render() {

		GL.disable(GL.CULL_FACE);
		this.shader.bind();

		this.mesh.forEach((m)=>{
			this.shader.uniform('uLocalMatrix', 'mat4', m.modelMatrix);

			if(m.material.diffuseMapID) {
				this.shader.uniform("useColor", "float", 0);
				this.shader.uniform("texture", "uniform1i", 0);
				m.texture.bind(0);
			} else {
				this.shader.uniform("uColor", "vec3", m.material.diffuseColor);
				this.shader.uniform("useColor", "float", 1);
			}

			GL.draw(m.mesh);
		});
		GL.enable(GL.CULL_FACE);
	}


}

export default ViewDae;