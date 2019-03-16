// Capture.js

import { GL } from 'alfrid';
import { saveImage } from './';

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

const capture = () => {
	window.addEventListener('keydown', (e) => {
		if(e.keyCode === 83 && e.metaKey) {
			e.preventDefault();
			const date = new Date();
			let strDate = 
				`${date.getFullYear()}.` + 
				`${date.getMonth() + 1}.` + 
				`${date.getDate()}-` + 
				`${date.getHours()}.` + 
				`${date.getMinutes()}.` + 
				`${date.getSeconds()}`;
			
			saveImage(GL.canvas, strDate);
		}
	});
}


export default capture();