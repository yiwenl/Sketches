// loadImages.js

import Promise from 'promise-polyfill';

const get = (url) => new Promise((resolve, reject) => {
	const img = new Image();
	img.onload = function onLoad() {
		resolve(this);
	};

	img.onerror = function onError() {
		reject(`Image not found : ${url}`);
	};

	img.src = url;
});


const loadImages = (paths) => Promise.all(
	paths.map(get)
);


export default loadImages;