// renderLight.js

import alfrid, { GL } from 'alfrid';
let bBall, bLine;

const renderLight = (light) => {
	if(!bBall) {
		console.log('init ball / line');
		bBall = new alfrid.BatchBall();
		bLine = new alfrid.BatchLine();
	}

	let s = .02;
	bBall.draw(light.origin, [s, s, s], light.color);
	bLine.draw(light.origin, light.target, light.color);
}


export { renderLight };