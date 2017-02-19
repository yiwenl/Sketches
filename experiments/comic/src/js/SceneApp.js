// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
import Assets from './Assets';
import vsOutline from 'shaders/outline.vert';
import fsOutline from 'shaders/outline.frag';

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 7;
		this.orbitalControl.radius.limit(5, 10);
		this.orbitalControl.rx.limit(-.05, 1.0);
		// const r = 1.0;
		// this.orbitalControl.ry.limit(-r, r);

		this._modelMatrix = mat4.create();
		const s = 1;
		mat4.scale(this._modelMatrix, this._modelMatrix, vec3.fromValues(s, s, s));
	}

	_initTextures() {
		console.log('init textures');

		this.shader = new alfrid.GLShader(null, alfrid.ShaderLibs.simpleColorFrag);
		this.shaderOutline = new alfrid.GLShader(vsOutline, alfrid.ShaderLibs.simpleColorFrag);

		this.shader.bind();
		this.shader.uniform("color", "vec3", [1, 1, 1]);
		this.shader.uniform("opacity", "float", 1);

		this.shaderOutline.bind();
		this.shaderOutline.uniform('color', 'vec3', [0, 0, 0]);
		this.shaderOutline.uniform('opacity', 'float', 1);


		this.shaderOutline.uniform("uOutlineWidth", "float", params.outlineWidth);
		this.shaderOutline.uniform("uOutlineNoise", "float", params.outlineNoise);
		this.shaderOutline.uniform("uOutlineNoiseStrength", "float", params.outlineNoiseStrength);
		
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bSky = new alfrid.BatchSkybox();

		this.meshFrames = Assets.get('frames');
		this.mesh = Assets.get('scene');
		this.meshBoxes = Assets.get('boxes');
	}


	render() {
		params.time += 0.01;
		const g = 1;
		GL.clear(g, g, g, 1);

		GL.rotate(this._modelMatrix);

		this.shader.bind();
		// GL.disable(GL.CULL_FACE);
		GL.gl.cullFace(GL.gl.FRONT);
		GL.draw(this.meshBoxes);
		GL.gl.cullFace(GL.gl.BACK);
		GL.draw(this.mesh);
		// GL.enable(GL.CULL_FACE);


		this.shaderOutline.bind();
		GL.draw(this.meshFrames);


		this.shaderOutline.uniform("uTime", "float", params.time);
		GL.gl.cullFace(GL.gl.FRONT);
		GL.draw(this.mesh);
		GL.gl.cullFace(GL.gl.BACK);
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}
}


export default SceneApp;