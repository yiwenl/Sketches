// HelperAxis.js
import _pixi from 'PIXI';
import Scheduler from 'scheduling';

class HelperAxis extends PIXI.mesh.RawMesh {
	constructor(mCamera) {
		const size = 10000;

		let geometry = new PIXI.mesh.Geometry()
		.addAttribute('aVertexPosition',
		              [
			              -size, 0, 0,
			               size, 0, 0,
			               0, -size, 0,
			               0,  size, 0,
			               0, 0, -size,
			               0, 0,  size
		               ], 3)
		.addAttribute('aColor',
		              [
			               1, 0, 0,
			               1, 0, 0,
			               0, 1, 0,
			               0, 1, 0,
			               0, 0, 1,
			               0, 0, 1
		               ], 3)
		.addIndex([0, 1, 2, 3, 4, 5]);         // the size of the attribute

		const uniforms = {
			uViewMatrix:mCamera.view,
			uProjectionMatrix:mCamera.projection,
		}

		const shader = new PIXI.Shader.from(`
			precision highp float;
			attribute vec3 aVertexPosition;
			attribute vec3 aColor;

			uniform mat4 uViewMatrix;
			uniform mat4 uProjectionMatrix;

			varying vec3 vColor;

			void main(void) {
			    gl_Position = uProjectionMatrix * uViewMatrix * vec4(aVertexPosition, 1.0);
			    vColor = aColor;
			}
			`, `
			precision highp float;
			varying vec3 vColor;

			void main(void) {
			    gl_FragColor = vec4(vColor, 1.0);
			}
			`, uniforms);

		

		super(geometry, shader, null, PIXI.DRAW_MODES.LINES);

		this._camera = mCamera;
	}
}


export default HelperAxis;