// WorldMap.js

import alfrid, { GL } from 'alfrid';
import World from './World';
import Assets from './Assets';

class WorldMap extends World {

	_init() {
		this.shaderColor = new alfrid.GLShader(null, alfrid.ShaderLibs.simpleColorFrag);
		this.shaderColor.bind();
		this.shaderColor.uniform("opacity", "float", 1);

		this.meshPlane = Assets.get('plane');
		this.meshSphere = alfrid.Geom.sphere(50, 12, true);
	}


	render() {
		this.shaderColor.bind();

		this.shaderColor.uniform("color", "vec3", [1, 0, 0]);
		GL.draw(this.meshSphere);

		this.shaderColor.uniform("color", "vec3", [0, 0, 1]);
		GL.draw(this.meshPlane);
		
	}
}


export default WorldMap;