// debugPolyfill.js

console.log('Debug Polyfill');

if(!window.gui) {
	window.gui = {
		add:()=>{

		}
	};	
}

