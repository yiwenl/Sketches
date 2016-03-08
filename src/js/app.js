// app.js
(function() {
	var App = function() {
		if(document.body) this._init();
		else {
			window.addEventListener("load", this._init.bind(this));
		}
	}

	var p = App.prototype;

	p._init = function() {

		let numItems = 5;
		let container = document.body.querySelector('.main-Container');
		for(let i=0; i<numItems; i++) {
			let div = document.createElement("div");
			div.className = 'exp-container';
			container.appendChild(div);

		}
	};

	new App();
})();


