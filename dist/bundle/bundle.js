(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
// Model.js

var Model = [{
	cover: 'assets/sketchCoverParticles.jpg',
	url: 'urlPath'
}, {
	cover: 'assets/sketchCoverReflection.jpg',
	url: 'urlPath'
}, {
	cover: 'assets/sketchCoverFlocking.jpg',
	url: 'urlPath'
}];

exports.default = Model;

},{}],2:[function(require,module,exports){
'use strict';

var _Model = require('./Model');

var _Model2 = _interopRequireDefault(_Model);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (document.body) {
	_init();
} else {
	window.addEventListener('load', _init);
} // app.js

function _init() {
	var numItems = _Model2.default.length;
	var container = document.body.querySelector('.main-Container');

	for (var i = 0; i < numItems; i++) {
		var div = document.createElement("div");
		div.className = 'exp-container';
		container.appendChild(div);

		var divImg = document.createElement("div");
		divImg.className = 'cover-container';
		div.appendChild(divImg);
		divImg.style.background = 'url(' + _Model2.default[i].cover + ')';
		divImg.style.backgroundSize = 'cover';
	}
}

},{"./Model":1}]},{},[2]);
