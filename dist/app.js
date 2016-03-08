"use strict";

// app.js
window.bongiovi = require("./libs/bongiovi.js");
var dat = require("dat-gui");

(function () {
	var SceneApp = require("./SceneApp");

	App = function App() {
		if (document.body) this._init();else {
			window.addEventListener("load", this._init.bind(this));
		}
	};

	var p = App.prototype;

	p._init = function () {
		this.canvas = document.createElement("canvas");
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.canvas.className = "Main-Canvas";
		document.body.appendChild(this.canvas);
		bongiovi.GL.init(this.canvas);

		this._scene = new SceneApp();
		bongiovi.Scheduler.addEF(this, this._loop);

		// this.gui = new dat.GUI({width:300});
	};

	p._loop = function () {
		this._scene.loop();
	};
})();

new App();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIGFwcC5qc1xud2luZG93LmJvbmdpb3ZpID0gcmVxdWlyZShcIi4vbGlicy9ib25naW92aS5qc1wiKTtcbnZhciBkYXQgPSByZXF1aXJlKFwiZGF0LWd1aVwiKTtcblxuKGZ1bmN0aW9uICgpIHtcblx0dmFyIFNjZW5lQXBwID0gcmVxdWlyZShcIi4vU2NlbmVBcHBcIik7XG5cblx0QXBwID0gZnVuY3Rpb24gQXBwKCkge1xuXHRcdGlmIChkb2N1bWVudC5ib2R5KSB0aGlzLl9pbml0KCk7ZWxzZSB7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgdGhpcy5faW5pdC5iaW5kKHRoaXMpKTtcblx0XHR9XG5cdH07XG5cblx0dmFyIHAgPSBBcHAucHJvdG90eXBlO1xuXG5cdHAuX2luaXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuXHRcdHRoaXMuY2FudmFzLndpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG5cdFx0dGhpcy5jYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdHRoaXMuY2FudmFzLmNsYXNzTmFtZSA9IFwiTWFpbi1DYW52YXNcIjtcblx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblx0XHRib25naW92aS5HTC5pbml0KHRoaXMuY2FudmFzKTtcblxuXHRcdHRoaXMuX3NjZW5lID0gbmV3IFNjZW5lQXBwKCk7XG5cdFx0Ym9uZ2lvdmkuU2NoZWR1bGVyLmFkZEVGKHRoaXMsIHRoaXMuX2xvb3ApO1xuXG5cdFx0Ly8gdGhpcy5ndWkgPSBuZXcgZGF0LkdVSSh7d2lkdGg6MzAwfSk7XG5cdH07XG5cblx0cC5fbG9vcCA9IGZ1bmN0aW9uICgpIHtcblx0XHR0aGlzLl9zY2VuZS5sb29wKCk7XG5cdH07XG59KSgpO1xuXG5uZXcgQXBwKCk7Il0sImZpbGUiOiJhcHAuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
