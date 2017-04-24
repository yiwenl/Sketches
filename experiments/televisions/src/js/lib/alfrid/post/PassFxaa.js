// PassFxaa.js

import GL from '../GLTool';
import Pass from './Pass';
import fsFxaa from '../shaders/fxaa.frag';

class PassFxaa extends Pass {
	constructor() {
		super(fsFxaa);
		this.uniform('uResolution', [1/GL.width, 1/GL.height]);
	}
}

export default PassFxaa;