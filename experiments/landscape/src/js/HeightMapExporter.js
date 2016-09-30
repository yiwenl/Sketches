// HeightMapExporter.js

const map = function(value, sx, sy, tx, ty) {
	const p = (value - sx) / (sy - sx);
	return tx + (ty - tx) * p;
}

class HeightMapExporter {

	constructor() {

	}

	getHeightMap(lat, lng) {
		//	get mapped x, y on world map
		//	get cropped map from location (x, y)
		//	apply algorithm to find mountains
	}


	_getMountains() {
		let m = getMountain();
		console.log(m.lat, m.lng);
		// this keyboard sounds amazing, and the typing experince is very comfortable too.
	}


	_findMountains() {
		
	}

}


export default HeightMapExporter;