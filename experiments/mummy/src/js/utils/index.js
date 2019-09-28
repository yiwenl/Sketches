// index.js

export { saveImage } from './saveImage';
// export { saveJson } from './saveJson';
// export { resize } from './resizeCanavs';
// export { resizeUI } from './resizeUI'

//	math
export const DEG = 180 / Math.PI;
export const RAD = Math.PI / 180;
export const biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);

export const map = (v, a, b, c, d) => {
	let p = (v - a) / (b - a);

	return p * ( d - c ) + c;
}


//	default promise call backs
export const logError = (e) => {	console.error('Error', e); }
export const logSuccess = (o) => {	
	o ? console.log('All Done', o)
	: console.log('All Done'); 
}


//	face tracking
export const isWebAssemblySupported = () => {
	function testSafariWebAssemblyBug() {

		var bin   = new Uint8Array([0,97,115,109,1,0,0,0,1,6,1,96,1,127,1,127,3,2,1,0,5,3,1,0,1,7,8,1,4,116,101,115,116,0,0,10,16,1,14,0,32,0,65,1,54,2,0,32,0,40,2,0,11]);
		var mod   = new WebAssembly.Module(bin);
		var inst  = new WebAssembly.Instance(mod, {});

		// test storing to and loading from a non-zero location via a parameter.
		// Safari on iOS 11.2.5 returns 0 unexpectedly at non-zero locations

		return (inst.exports.test(4) !== 0);
	}

	var isWebAssemblySupported = (typeof WebAssembly === 'object');

	if(isWebAssemblySupported && !testSafariWebAssemblyBug()) {
		isWebAssemblySupported = false;
	}

	return isWebAssemblySupported;
}

export const readWASMBinary = (url, onload, onerror, onprogress) => {

	var xhr = new XMLHttpRequest();

	xhr.open("GET", url, true);
	xhr.responseType = "arraybuffer";
	xhr.onload = function xhr_onload() {

	if (xhr.status === 200 || xhr.status === 0 && xhr.response) {
		onload(xhr.response);
		return;
	}
		onerror()
	};
	xhr.onerror = onerror;
	xhr.onprogress = onprogress;
	xhr.send(null);

}

export const addBRFScript = (brfv4BaseURL, brfv4SDKName) => {
	var script = document.createElement("script");

	script.setAttribute("type", "text/javascript");
	script.setAttribute("async", true);
	script.setAttribute("src", brfv4BaseURL + brfv4SDKName + ".js");

	document.getElementsByTagName("head")[0].appendChild(script);	
}


//	 face mesh
export const getFaceVertexPosition = (face, point, defaultZ=0) => {
	let rx = -face.rotationX * DEG; 
	let ry = -face.rotationY * DEG; 
	let rz =  face.rotationZ * DEG; 


	const x   =  (point.x - (400 * 0.5));
	const y   = -(point.y - (300 * 0.5))
	  - ((Math.abs(ry) / 45.0) * -2.0)
	  + ((rx < 0) ? (rx * 0.20) : 0.0);
	const z   =  defaultZ;

	return {
		x, y, z
	}
}

//	css class toggle

export const addClass = (elm, strClass) => {
	if(!elm.classList.contains(strClass)) {
		elm.classList.add(strClass)
	}
}

export const removeClass = (elm, strClass) => {
	if(elm.classList.contains(strClass)) {
		elm.classList.remove(strClass)
	}
}
