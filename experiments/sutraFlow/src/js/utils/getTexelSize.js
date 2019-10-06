// getTexelSize.js
import Config from '../Config';

export default function() {
	const {innerWidth, innerHeight} = window;
	return [
		1/(innerWidth >> Config.TEXTURE_DOWNSAMPLE), 
		1/(innerHeight >> Config.TEXTURE_DOWNSAMPLE)
	];
}