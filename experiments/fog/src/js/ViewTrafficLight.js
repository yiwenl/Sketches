// ViewTrafficLight.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

class ViewTrafficLight extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.copyFrag);
	}


	_init() {
		this.mesh = Assets.get('trafficlight');
		this.texture = Assets.get('ao');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewTrafficLight;