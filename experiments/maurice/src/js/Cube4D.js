// View4DCube.js

import alfrid, { GL, GLShader, EaseNumber } from 'alfrid';
import getRandomAxis from './utils/getRandomAxis';

var random = function(min, max) { return min + Math.random() * (max - min);	}
let mesh;

class View4DCube {
	
	constructor(mPosition=[0, 0, 0]) {
		this._ease = random( 0.02, 0.05 ) * 0.5;

		this._isDirty = true;
		this._scale = new EaseNumber(1, this._ease);
		this._mtxScale = mat4.create();

		this.dimension = vec3.fromValues(1, 1, 1);
		this._rotation = 0;
		this._rotationAxis = getRandomAxis();
		this._position = vec3.clone(mPosition);

		
		this._rotationMask = 0;
		this._rotationAxisMask = getRandomAxis();
		this._positionMask = vec3.create();

		this._modelMatrix = mat4.create();
		this._mtxRotation = mat4.create();
		this._mtxRotationInvert = mat4.create();
		this._mtxRotationMask = mat4.create();
		this._mtxRotationMaskInvert = mat4.create();

		this._dx = new EaseNumber(.5, this._ease);
		this._dy = new EaseNumber(.5, this._ease);
		this._dz = new EaseNumber(.5, this._ease);

		this._boundRight = vec4.fromValues(1, 0, 0., this._dx.value);
		this._boundLeft = vec4.fromValues(-1, 0, 0., this._dx.value);
		this._boundUp = vec4.fromValues(0.001, 1, 0, this._dy.value);
		this._boundBottom = vec4.fromValues(0.001, -1, 0, this._dy.value);
		this._boundFront = vec4.fromValues(0, 0, 1, this._dz.value);
		this._boundBack = vec4.fromValues(0, 0, -1, this._dz.value);

		this.dimensionMask = vec3.fromValues(this.dx, this.dy, this.dz);

		this._bounds = [
			this._boundUp,
			this._boundBottom,
			this._boundRight,
			this._boundLeft,
			this._boundFront,
			this._boundBack
		];

		this._init();
	}


	_init() {
		if(!mesh) {
			mesh = alfrid.Geom.cube(1, 1, 1);
		}
	}


	renderCube(mShader, mShadowMatrix, mDepthTexture, mTexture) {
		const bounds = this._bounds.map( bound => {
			const boundTransformed = vec4.create();
			vec4.transformMat4(boundTransformed, bound, this._mtxRotationMask);

			return boundTransformed;
		});


		mShader.uniform("uPositionMask", "vec3", this._positionMask);
		mShader.uniform(params.light);
		mShader.uniform("uInvertRotationMatrix", "mat4", this._mtxRotationInvert);
		mShader.uniform("uInvertRotationMaskMatrix", "mat4", this._mtxRotationMaskInvert);
		mShader.uniform("uShadowMatrix", "mat4", mShadowMatrix);
		mShader.uniform("textureDepth", "uniform1i", 0);
		mDepthTexture.bind(0);
		mShader.uniform("texture", "uniform1i", 0);
		mTexture.bind(0);
		bounds.forEach( (bound, i) => {
			mShader.uniform(`uPlane${i}`, "vec4", bound);
		});
		GL.rotate(this._modelMatrix);
		GL.draw(mesh);
	}


	renderMask(mShader, mShadowMatrix, mDepthTexture, mTexture) {
		mShader.uniform(params.light);
		mShader.uniform("uPositionMask", "vec3", this._positionMask);
		mShader.uniform("uRotationMask", "mat4", this._mtxRotationMask);
		mShader.uniform("uInvertRotationMatrix", "mat4", this._mtxRotationInvert);
		mShader.uniform("uInvertRotationMaskMatrix", "mat4", this._mtxRotationMaskInvert);
		mShader.uniform("uDimension", "vec3", this.dimension);
		mShader.uniform("uDimensionMask", "vec3", this.dimensionMask);

		mShader.uniform("uShadowMatrix", "mat4", mShadowMatrix);
		mShader.uniform("textureDepth", "uniform1i", 0);
		mDepthTexture.bind(0);
		mShader.uniform("texture", "uniform1i", 0);
		mTexture.bind(0);
		
		GL.rotate(this._modelMatrix);
		GL.draw(mesh);
	}


	update() {
		if(this._isDirty) {
			this._updateRotationMatrices();
			this._isDirty = false;
		}

		const scale = this._scale.value;
		mat4.fromScaling(this._mtxScale, vec3.fromValues(scale, scale, scale));

		mat4.fromTranslation(this._modelMatrix, this._position);
		mat4.multiply(this._modelMatrix, this._modelMatrix, this._mtxScale);
		mat4.multiply(this._modelMatrix, this._modelMatrix, this._mtxRotation);

		this._boundRight[3] = this._dx.value;
		this._boundLeft[3] = this._dx.value;
		this._boundUp[3] = this._dy.value;
		this._boundBottom[3] = this._dy.value;
		this._boundFront[3] = this._dz.value;
		this._boundBack[3] = this._dz.value;

		this.dimensionMask = vec3.fromValues(this.dx, this.dy, this.dz);
	}


	_updateRotationMatrices() {
		let q = quat.create();

		quat.setAxisAngle(q, this._rotationAxis, this._rotation);
		mat4.fromQuat(this._mtxRotation, q);
		mat4.invert(this._mtxRotationInvert, this._mtxRotation);

		quat.setAxisAngle(q, this._rotationAxisMask, this._rotationMask);
		mat4.fromQuat(this._mtxRotationMask, q);
		mat4.invert(this._mtxRotationMaskInvert, this._mtxRotationMask);
	}



	get rotation() {
		return this._rotation;
	}

	set rotation(mValue) {
		this._rotation = mValue;
		this._isDirty = true;
	}

	get scale() {
		return this._scale.value;
	}

	set scale(mValue) {
		this._scale.value = mValue;
	}


	get rotationMask() {
		return this._rotationMask;
	}

	set rotationMask(mValue) {
		this._rotationMask = mValue;
		this._isDirty = true;
	}

	get position() {
		return this._position;
	}

	set position(mValue) {
		vec3.copy(this._position, mValue);
	}


	get positionMask() {
		return this._positionMask;
	}

	set positionMask(mValue) {
		vec3.copy(this._positionMask, mValue);
	}


	get dx() { return this._dx.value; }
	set dx(value) { this._dx.value = value; }

	get dy() { return this._dy.value; }
	set dy(value) { this._dy.value = value; }

	get dz() { return this._dz.value; }
	set dz(value) { this._dz.value = value; }
}

export default View4DCube;