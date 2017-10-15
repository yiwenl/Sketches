// SceneApp.js

import alfrid, { Scene, GL, GLShader } from 'alfrid';
import Cube4D from './Cube4D';
import ViewBackground from './ViewBackground';
import AnimateCube from './AnimateCube';
import Assets from './Assets';

import getCubePosition from './utils/getCubePosition';
import getRandomRotation from './utils/getRandomRotation';

import vsCube from 'shaders/cube.vert';
import fsCube from 'shaders/cube.frag';

import vsCubeMask from 'shaders/cubeMask.vert';
import fsCubeMask from 'shaders/cubeMask.frag';

const num = 8;
const RAD = Math.PI / 180;
const FOV = 65 * RAD;
const center = vec3.fromValues(0, 0, 0);
const up = vec3.fromValues(0, 1, 0);

var random = function(min, max) { return min + Math.random() * (max - min);	}

class SceneApp extends Scene {
	constructor() {
		super();
		GL.enableAlphaBlending();
		this.orbitalControl.radius.value = 10;
		const r = 0.1;
		this.orbitalControl.rx.limit(-r, r);
		this.orbitalControl.ry.limit(-r, r);
		this.orbitalControl.lock(true);
		this.camera.setPerspective(FOV, GL.aspectRatio, 1, 50);

		gui.add(this, 'spin');
		gui.add(this, 'preSpin');

		this.cameraProj = new alfrid.CameraPerspective();
		this.cameraProj.setPerspective(45*RAD, 1, 1, 50);

		this._biasMatrix = mat4.fromValues(
			0.5, 0.0, 0.0, 0.0,
			0.0, 0.5, 0.0, 0.0,
			0.0, 0.0, 0.5, 0.0,
			0.5, 0.5, 0.5, 1.0
		);

		this._shadowMatrix = mat4.create();

		this._index = 0;

		this.resize();

		this.shaderCube = new GLShader(vsCube, fsCube);
		this.shaderMask = new GLShader(vsCubeMask, fsCubeMask);

		this._btnNext = document.body.querySelector('.button-next');
		this._btnNext.addEventListener('click', ()=>this.preSpin());


		alfrid.Scheduler.delay(()=>{
			document.body.classList.add('active');
		}, null, 1000);
	}

	_initTextures() {
		const size = 1024;
		this._fbo = new alfrid.FrameBuffer(size, size, {minFilter:GL.LINEAR, magFilter:GL.LINEAR, wrapS:GL.CLAMP_TO_EDGE, wrapT:GL.CLAMP_TO_EDGE});
	}

	_initViews() {

		this._vBg = new ViewBackground();
		this._vBg.position[2] = -5;
		this._vBg.scale = [2, 2, 1];

		this._vFg = new ViewBackground();
		this._vFg.position[2] = 7.5;
		this._vFg.scale = [.5, .5, 1];

		this._cubes = [];
		
		for(let i=0; i<num; i++) {
			for(let j=0; j<num; j++) {
				let x = -num/2 + i + .5;
				let y = -num/2 + j + .5;
				let pos = [x, y, 0];

				let d = 1.25;

				const cube = new AnimateCube(pos, d);
				cube.posOrg = pos;
				cube.rotation = 0;
				cube.rotationMask = 0;

				this._cubes.push(cube);
			}
		}

		// this._vTest = new Cube4D();
		// this._vTest.rotationMask = Math.random();
	}


	preSpin() {
		document.body.classList.toggle('active', false);
		this._vBg.show();
		this._vFg.hide();
		
		const r = .2;
		const angle = .1;
		this._cubes.forEach( cube => {
			let d = random(1, 3) * .1;
			const { position } = cube;
			const target = [position[0], position[1], position[2] + d];
			const targetMask = [random(-r, r), random(-r, r), -d/2];
			const rotation = getRandomRotation(angle);
			const rotationMask = getRandomRotation(angle);

			cube.moveTo(target, targetMask, rotation, rotationMask, 2.5);
		});

		alfrid.Scheduler.delay(()=>this.spin(), null, 1000);
	}


	spin() {
		document.body.classList.toggle('active', false);
		this._vBg.show();
		this._vFg.hide();
		
		const r = 2;
		this._cubes.forEach( cube => {
			let d = random(2, 3) * 2;
			// if(Math.random() > .5) {
			// 	d *= -1;
			// }
			const { position } = cube;
			const target = [position[0], position[1], position[2] + d];
			const targetMask = [random(-r, r), random(-r, r), -d/2];
			const rotation = getRandomRotation();
			const rotationMask = getRandomRotation();

			cube.moveTo(target, targetMask, rotation, rotationMask);
		});


		alfrid.Scheduler.delay(()=>this._onSpinned(), null, 2000);
	}


	_onSpinned() {
		this._vBg.hide();
		this._index ++;
		if(this._index >= 18) {
			this._index = 0;
		}
		this._vFg.show();

		alfrid.Scheduler.delay(()=>{
			this.reset();
		}, null, 1000);
	}


	reset() {
		this._cubes.forEach( cube => {
			let d = 2;
			const rotation = getRandomRotation(0);
			const rotationMask = getRandomRotation(0);

			cube.setTo(cube.posOrg, [0, 0, 0], rotation, rotationMask);
		});

		document.body.classList.toggle('active', true);
	}


	updateProjection() {
		this.cameraProj.lookAt(this.camera.position, center, up);
		mat4.multiply(this._shadowMatrix, this.cameraProj.projection, this.cameraProj.viewMatrix);
		mat4.multiply(this._shadowMatrix, this._biasMatrix, this._shadowMatrix);
	}


	renderDepth() {
		this._fbo.bind();
		GL.clear(0, 0, 0, 0);
		GL.setMatrices(this.cameraProj);
		this._renderCubes();
		this._fbo.unbind();
	}


	render() {
		this.updateProjection();

		this._cubes.forEach(cube => {
			cube.update();
		});	

		this.renderDepth();


		GL.clear(1, 1, 1, 1);
		GL.setMatrices(this.camera);

		this._vBg.render(this._shadowMatrix, this.nextTexture);
		this._renderCubes();
		this._vFg.render(this._shadowMatrix, this.currentTexture);
		
	}


	_renderCubes() {
		if(!params.render.cube) { return; }


		this.shaderCube.bind();
		this._cubes.forEach(cube => {
			cube.renderCube(this.shaderCube, this._shadowMatrix, this._fbo.getDepthTexture(), this.currentTexture);
		});	


		this.shaderMask.bind();
		this._cubes.forEach(cube => {
			cube.renderMask(this.shaderMask, this._shadowMatrix, this._fbo.getDepthTexture(), this.currentTexture);
		});	

		// this._vTest.render(this._shadowMatrix, this._fbo.getDepthTexture());
	}


	resize() {
		GL.setSize(window.innerWidth, window.innerHeight);
		this.camera.setAspectRatio(GL.aspectRatio);
	}


	get currentTexture() {
		return Assets.get(`page${this._index}`);
	}


	get nextTexture() {
		const next = this._index === 17 ? 0 : this._index + 1;
		return Assets.get(`page${next}`);
	}
}


export default SceneApp;