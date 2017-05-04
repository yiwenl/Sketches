// HelperGround.js
import _pixi from 'PIXI';
import Scheduler from 'scheduling';

class HelperDotsPlane extends PIXI.mesh.RawMesh {
	constructor(mCamera) {
		const size = 100;
		const points = [];
		const indices = [];

		const numPoints = 100;
		let x, y, count = 0;

		for(let i=0; i<numPoints; i++) {
			for(let j=0; j<numPoints; j++) {
				x = -numPoints/2 + i;
				y = -numPoints/2 + j;

				points.push(x);
				points.push(0);
				points.push(y);
				indices.push(count);

				points.push(x);
				points.push(y);
				points.push(0);
				indices.push(count+1);

				count += 2;
			}
		}

		let geometry = new PIXI.mesh.Geometry()
		.addAttribute('aVertexPosition', points, 3)
		.addIndex(indices);         // the size of the attribute

		const uniforms = {
			uViewMatrix:mCamera.view,
			uProjectionMatrix:mCamera.projection,
		}


		let shader = new PIXI.Shader.from(`
			precision mediump float;
			attribute vec3 aVertexPosition;
			uniform mat4 uViewMatrix;
			uniform mat4 uProjectionMatrix;


			void main() {
				vec4 position = uProjectionMatrix * uViewMatrix * vec4(aVertexPosition, 1.0);
				gl_Position = position;
				gl_PointSize = 1.0;
			}
			`, `
			precision highp float;

			void main(void) {
			    gl_FragColor = vec4(vec3(0.5), 1.0);
			}
			`, uniforms);

		
		super(geometry, shader, null, PIXI.DRAW_MODES.POINTS);

		this._camera = mCamera;
	}
}


export default HelperDotsPlane;