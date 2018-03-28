// getMouse.js

export default function (e) {
	let x, y;

	if(e.touches) {
		x = e.touches[0].pageX;
		y = e.touches[0].pageY;
	} else {
		x = e.clientX;
		y = e.clientY;
	}


	return {
		x, y
	};
}