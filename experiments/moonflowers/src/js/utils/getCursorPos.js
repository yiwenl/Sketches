// getCursorPos.js

const getCursorPos = function(e) {
	if(e.touches) {
		return {
			x:e.touches[0].pageX,
			y:e.touches[0].pageY
		}
	} else {
		return {
			x:e.clientX,
			y:e.clientY
		}
	}
}


export default getCursorPos;