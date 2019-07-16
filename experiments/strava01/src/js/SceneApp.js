// SceneApp.js

import alfrid, { Scene, GL } from 'alfrid';
// import ViewObjModel from './ViewObjModel';
import Assets from './Assets';
import Config from './Config';

import ViewRun from './ViewRun';

import RunData from './data/run.json';
import { map } from 'randomutils';


class SceneApp extends Scene {
	constructor() {

		super();
		this.resize();
		GL.enableAlphaBlending();
		this.orbitalControl.rx.value = this.orbitalControl.ry.value = 0.3;
		this.orbitalControl.radius.value = 5;

		const _points = RunData.gpx.trk.trkseg.trkpt;

		let maxLat, minLat, maxLon, minLon, minEle, maxEle;

		const points = _points.map( (p, i) => {

			const lat = parseFloat(p.lat);
			const lon = parseFloat(p.lon);
			const ele = parseFloat(p.ele);
			const time = new Date(p.time);

			if(!maxLat) {
				maxLat = lat;
				minLat = lat;
			} else {
				maxLat = Math.max(maxLat, lat);
				minLat = Math.min(minLat, lat);
			}

			if(!maxLon) {
				maxLon = lon;
				minLon = lon;
			} else {
				maxLon = Math.max(maxLon, lon);
				minLon = Math.min(minLon, lon);
			}

			if(!minEle) {
				maxEle = ele;
				minEle = ele;
			} else {
				maxEle = Math.max(maxEle, ele);
				minEle = Math.min(minEle, ele);
			}


			return {
				lat,
				lon,
				ele,
				time
			};
		});

		let avgLat = (maxLat + minLat) * 0.5;
		let avgLon = (maxLon + minLon) * 0.5;

		this.data = {
			points,
			info : {
				maxLat, 
				minLat, 
				maxLon, 
				minLon,
				avgLat,
				avgLon,
				minEle, 
				maxEle
			}
		}

		console.log('Boundaries :', this.data);

		this._vRun = new ViewRun(this.data);
	}


	_initTextures() {
		console.log('init textures');
	}


	_initViews() {
		console.log('init views');

		this._bCopy = new alfrid.BatchCopy();
		this._bAxis = new alfrid.BatchAxis();
		this._bDots = new alfrid.BatchDotsPlane();
	}


	render() {
		GL.clear(0, 0, 0, 0);

		this._bAxis.draw();
		this._bDots.draw();

		this._vRun.render();
	}


	toResize(w, h) {
		const { innerWidth, innerHeight, devicePixelRatio } = window;
		w = w || innerWidth;
		h = h || innerHeight;
		GL.setSize(w, h);
		let tw = Math.min(w, innerWidth);
		let th = Math.min(h, innerHeight);

		const sx = innerWidth / w;
		const sy = innerHeight / h;
		const scale = Math.min(sx, sy);
		tw = w * scale;
		th = h * scale;

		GL.canvas.style.width = `${tw}px`;
		GL.canvas.style.height = `${th}px`;
		this.camera.setAspectRatio(GL.aspectRatio);
	}

	resize() {
		this.toResize(window.innerWidth, window.innerHeight);
	}
}


export default SceneApp;