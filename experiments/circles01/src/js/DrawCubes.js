// DrawCubes.js

import alfrid, { GL } from 'alfrid';

import { random, getRandomElement } from 'randomutils'
import getColorTheme from 'get-color-themes';
import vs from 'shaders/cubes.vert';
import fs from 'shaders/cubes.frag';

class DrawCubes extends alfrid.Draw {
	constructor() {
		super();

		const r = 1;
		const getPos = () => {
			return [random(-r, r), random(-r, r), random(-r, r)];
		}

		const colorTheme = getColorTheme();

		let num = 50;
		const positions = [];
		const extras = [];
		const colors = [];
		const axis = [];
		while(num--) {
			positions.push(getPos());
			extras.push([random(Math.PI), random(.2, .75), random(1, 2)]);
			axis.push([random(-1, 1), random(-1, 1), random(-1, 1)]);
			colors.push(getRandomElement(colorTheme));
		}


		this.useProgram(vs, fs)
			.setMesh(alfrid.Geom.cube(1, 1, 1))
			.bufferInstance(positions, 'aPosOffset')
			.bufferInstance(extras, 'aExtra')
			.bufferInstance(axis, 'aAxis')
			.bufferInstance(colors, 'aColor')

	}
}

export default DrawCubes;