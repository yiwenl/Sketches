// app.js

import Model from './Model';


if(document.body) {
	_init();
} else {
	window.addEventListener('load', _init);
}


function _init() {
	const numItems = Model.length;
	const container = document.body.querySelector('.main-Container');

	for(let i=0; i<numItems; i++) {
		let div = document.createElement("div");
		div.className = 'exp-container';
		container.appendChild(div);
		

		let divImg = document.createElement("div");
		divImg.className = 'cover-container'
		div.appendChild(divImg);
		divImg.style.background = 'url(' + Model[i].cover + ')';
		divImg.style.backgroundSize = 'cover';
	}
}

