
import Object3D from './objects/Object3D';

class Mesh extends Object3D {

	constructor(geometry, material) {
		super();

		this.geometry = geometry;
		this.material = material;
	}


}

export default Mesh;