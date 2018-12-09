// ViewFloor.js

import alfrid, { GL } from 'alfrid';
import Config from './Config';
import vs from 'shaders/floor.vert';
import fs from 'shaders/floor.frag';


const contains = (v, a) => {
	let d = 0;
	let duplicated = false;
	a.forEach( vv => {
		d = vec3.distance(vv, v);
		if( d < 0.01) {
			duplicated = true;
		}
	});

	return duplicated;
}

const getUniqueVertices = (vertices) => {
	const _vertices = [];
	vertices.forEach( v => {
		if(_vertices.length === 0) {
			_vertices.push(v);
		} else {
			if(!contains(v, _vertices)) {
				_vertices.push(v);
			}
		}
	})
	return _vertices;
}

class ViewFloor extends alfrid.View {
	
	constructor(vertices) {
		const _vertices = getUniqueVertices(vertices);
		const _fs = fs.replace('${NUM}', _vertices.length)
		super(vs, _fs);

		this._lightVertes = [];
		_vertices.forEach( v => {
			this._lightVertes = this._lightVertes.concat(v);
		});

	}


	_init() {
		const s = 10;
		const num = 100;
		this.mesh = alfrid.Geom.plane(s, s, num, 'xz');
	}


	render(vertices, lightMatrix, texture) {
		let _vertices = [];
		vertices.forEach( v => {
			_vertices = _vertices.concat(v);
		});
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		this.shader.uniform("lightColor", "vec3", [1, 1, 1]);
		this.shader.uniform("lightIntensity", "float", Config.lightIntensity);
		this.shader.uniform("lightMatrixWorld", "mat4", lightMatrix);
		this.shader.uniform("lightverts", "vec3", this._lightVertes);
		GL.draw(this.mesh);
	}


}

export default ViewFloor;