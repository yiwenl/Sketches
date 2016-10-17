import alfrid, { GL } from 'alfrid';
import fs from '../shaders/noise.frag';

class ViewNoise extends alfrid.View {
	
	constructor() {
		super(alfrid.ShaderLibs.bigTriangleVert, fs);
		this.time = Math.random() * 0xFF;
		this.seed = Math.random() * 0xFF;
		this.test = new alfrid.EaseNumber(0);
	}


	_init() {
		this.mesh = alfrid.Geom.bigTriangle();
	}


	render() {
		const { speed, noiseScale, isOne } = params;
		this.time += speed;

		this.test.value = isOne ? 1 : 0;
		this.shader.bind();
		this.shader.uniform("uTime", "float", this.time);
		// this.shader.uniform("uTime", "float", this.test.value);
		this.shader.uniform("uSeed", "float", this.seed);
		this.shader.uniform("uNoiseScale", "float", noiseScale);
		GL.draw(this.mesh);
	}


}

export default ViewNoise;