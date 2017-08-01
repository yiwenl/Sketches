// ViewTerrain.js

import alfrid, { GL } from 'alfrid';
import Assets from './Assets';

class ViewTerrain extends alfrid.View {
	
	constructor() {
		super();
	}


	_init() {
		this.mesh = Assets.get('terrain');
	}


	render() {
		this.shader.bind();
		GL.draw(this.mesh);
	}


}

export default ViewTerrain;