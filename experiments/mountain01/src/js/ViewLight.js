// ViewLight.js

import alfrid, { GL } from 'alfrid';

class ViewLight extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.simpleColorFrag);
	}


	_init() {
		let s = 1;
		const num = 1;
		this.mesh = alfrid.Geom.plane(s, 2, num);
		this.matrix = mat4.create();
		mat4.translate(this.matrix, this.matrix, vec3.fromValues(0, 2.5, -1));

		this.numVerts = this.mesh.vertices.length
	}


	update(mRotation) {
		let s = 1;
			
		mat4.identity(this.matrix);
		mat4.rotateY(this.matrix, this.matrix, -mRotation);
		mat4.translate(this.matrix, this.matrix, vec3.fromValues(0, 2.5, -1));
	}


	render(mRotation) {
		this.update(mRotation);
		

		/*/
		let z = Math.sin(alfrid.Scheduler.deltaTime) * .5;
		let a = Math.cos(alfrid.Scheduler.deltaTime * 1.3489848) * .5 + .5;
		mat4.identity(this.matrix);
		mat4.rotateX(this.matrix, this.matrix, a);
		mat4.translate(this.matrix, this.matrix, vec3.fromValues(0, 0, -1 + z));
		//*/


		GL.pushMatrix();
		this.shader.bind();
		GL.rotate(this.matrix);

		this.shader.uniform("color", "vec3", [1, 1, 1]);
		this.shader.uniform("opacity", "float", 1);

		GL.draw(this.mesh);
		GL.popMatrix();
	}


}

export default ViewLight;