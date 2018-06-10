// saveImage.js

const saveImage = function (canvas, filename) {
	const link = document.createElement('a');
	link.setAttribute('href', canvas.toDataURL());
	link.setAttribute('download', filename);
	const event = document.createEvent('MouseEvents');
	event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
	link.dispatchEvent(event);
};

export default saveImage;