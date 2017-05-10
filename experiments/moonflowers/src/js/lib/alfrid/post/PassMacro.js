// PassMacro.js

class PassMacro {
	constructor() {
		this._passes = [];
	}

	addPass(pass) {
		this._passes.push(pass);
	}

	get passes() {
		return this._passes;
	}
}

export default PassMacro;