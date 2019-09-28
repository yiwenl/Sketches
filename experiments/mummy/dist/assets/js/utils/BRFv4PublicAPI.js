// This public stuff of the API is already build into the SDK.
// You don't need to load this js file additionally.
//
// This is here for your reference only.

(function(lib) {
	"use strict";

	// utility function

	lib.defaultValue = function(arg, val) {
		return typeof arg !== 'undefined' ? arg : val;
	};

	// API

	lib.Point = function(_x, _y) {
		this.x 					= lib.defaultValue(_x, 0.0);
		this.y 					= lib.defaultValue(_y, 0.0);
	};
	lib.Point.prototype.setTo = function(_x, _y) {
		this.x 					= lib.defaultValue(_x, 0.0);
		this.y 					= lib.defaultValue(_y, 0.0);
	};

	lib.Rectangle = function(_x, _y, _width, _height) {
		this.x 					= lib.defaultValue(_x, 0.0);
		this.y 					= lib.defaultValue(_y, 0.0);
		this.width 				= lib.defaultValue(_width, 0.0);
		this.height 			= lib.defaultValue(_height, 0.0);
	};
	lib.Rectangle.prototype.setTo = function(_x, _y, _width, _height) {
		this.x 					= lib.defaultValue(_x, 0.0);
		this.y 					= lib.defaultValue(_y, 0.0);
		this.width 				= lib.defaultValue(_width, 0.0);
		this.height 			= lib.defaultValue(_height, 0.0);
	};

	lib.BRFMode = {
		FACE_DETECTION:			"mode_face_detection",
		FACE_TRACKING:			"mode_face_tracking",
		POINT_TRACKING:			"mode_point_tracking"
	};

	lib.BRFState = {
		FACE_DETECTION:			"state_face_detection",
		FACE_TRACKING_START:	"state_face_tracking_start",
		FACE_TRACKING:			"state_face_tracking",
		RESET:					"state_reset"
	};

	lib.BRFFace = function() {

		this.lastState 			= lib.BRFState.RESET;
		this.state				= lib.BRFState.RESET;
		this.nextState			= lib.BRFState.RESET;

		this.vertices			= [];
		this.triangles			= [];
		this.points				= [];
		this.bounds				= new lib.Rectangle(0, 0, 0, 0);
		this.refRect			= new lib.Rectangle(0, 0, 0, 0);

		this.candideVertices	= [];
		this.candideTriangles	= [];

		this.scale				= 1.0;
		this.translationX		= 0.0;
		this.translationY		= 0.0;
		this.rotationX			= 0.0;
		this.rotationY			= 0.0;
		this.rotationZ			= 0.0;
	};

})(brfv4);