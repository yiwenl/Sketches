// getMesh.js

import alfrid from 'alfrid';
let _instance;

export default function () {
	if(!_instance) {
		_instance = alfrid.Geom.bigTriangle();
		_instance.id = `BigTriangle${Math.floor(Math.random() * 10)}`;
	}

	return _instance;
}