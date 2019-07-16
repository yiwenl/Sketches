// ViewRun.js

import alfrid, { GL } from 'alfrid';
import { map } from 'randomutils';

import Config from './Config';
import vs from 'shaders/run.vert';
import fs from 'shaders/run.frag';

class ViewRun extends alfrid.View {
	
	constructor(mData) {
		super(vs, fs);
		this._data = mData;
		this._initData();
	}


	_init() {
		const yz = 0.1;
		this.mesh = alfrid.Geom.cube(0.25, yz, yz);
		// this.mesh = alfrid.Geom.cube(yz, yz, 1.0);
	}


	_initData() {
		const { info, points } = this._data;
		const { avgLat, avgLon, minEle, maxEle } = info

		// const posOffset = [];
		const posOffset = points.map( p => {
			let x = (p.lon - avgLon) * 2.0;
			let z = (p.lat - avgLat);
			let y = map(p.ele, minEle, maxEle, 0, 1);

			return [x, y, z]	
		});

		const posNext = points.map( (pp, i) => {
			let p;
			if(i === points.length - 1) {
				p = points[i]
			} else {
				p = points[i+1];
			}

			let x = (p.lon - avgLon) * 2.0;
			let z = (p.lat - avgLat);
			let y = map(p.ele, minEle, maxEle, 0, 1);

			return [x, y, z];
		});

		console.log(posOffset.length, posNext.length);

		console.log(posNext);

		this.mesh.bufferInstance(posOffset, 'aPosOffset');
		this.mesh.bufferInstance(posNext, 'aPosNext');
	}


	render() {
		this.shader.bind();
		this.shader.uniform("uMapScale", "float", Config.mapScale);
		this.shader.uniform("uHeightScale", "float", Config.heightScale);
		GL.draw(this.mesh);
	}


}

export default ViewRun;