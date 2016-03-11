(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
var ExpModel = [{
	cover: 'assets/sketchCoverParticles.jpg',
	url: 'http://yiwenl.github.io/Sketches/experiments/selfshadingParticles/dist/index.html',
	id: 0,
	opened: false
}, {
	cover: 'assets/sketchCoverReflection.jpg',
	url: 'http://yiwenl.github.io/Sketches/experiments/reflectiveSoundVis/dist/index.html',
	id: 1,
	opened: false
}, {
	cover: 'assets/sketchCoverNefertiti.jpg',
	url: 'http://yiwenl.github.io/Sketches/experiments/Nefertiti/dist/index.html',
	id: 2,
	opened: false
}, {
	cover: 'assets/sketchCoverFlocking.jpg',
	url: 'http://yiwenl.github.io/Sketches/experiments/flockingBW/dist/index.html',
	id: 3,
	opened: false
}, {
	cover: 'assets/sketchCoverRosetta.jpg',
	url: 'http://yiwenl.github.io/Sketches/experiments/rosetta/dist/index.html',
	id: 4,
	opened: false
}, {
	cover: 'assets/coverSketchNike.jpg',
	url: 'http://yiwenl.github.io/Sketches/experiments/Bloom/dist/index.html',
	id: 5,
	opened: false
}, {
	cover: 'assets/coverSketchBloom.jpg',
	url: 'http://yiwenl.github.io/Sketches/experiments/feathers/dist/index.html',
	id: 6,
	opened: false
}, {
	cover: 'assets/coverSketchClustering.jpg',
	url: 'http://yiwenl.github.io/Sketches/experiments/flocking01/dist/index.html',
	id: 7,
	opened: false
}];

exports.default = ExpModel;

},{}],2:[function(require,module,exports){
'use strict';

var _ExpModel = require('./ExpModel');

var _ExpModel2 = _interopRequireDefault(_ExpModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_ExpModel2.default);

},{"./ExpModel":1}]},{},[2]);

//# sourceMappingURL=bundle.js.map
