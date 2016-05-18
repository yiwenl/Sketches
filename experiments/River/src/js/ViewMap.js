// ViewMap.js
import alfrid, { GL } from 'alfrid';

class ViewMap extends alfrid.View {
	
	constructor() {
		super(null, alfrid.ShaderLibs.copyFrag);
	}


	_init() {
		this.mesh = alfrid.Geom.plane(5, 5, 1, false, 'xz');

		this._texture = new alfrid.GLTexture(getAsset('map'));
	}


	render() {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this._texture.bind(0);
		GL.draw(this.mesh);
	}


}

export default ViewMap;