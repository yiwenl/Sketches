// BRFv4 example setup and handling:
//
// Init everything:
// + image data (either webcam or picture)
// + BRFv4 SDK with the size of the image data
// + Set all the parameters for BRFv4 according to the chosen example
// + Reinit if image data size changes

(function() {
	"use strict";

	var example		= brfv4Example;

	var imageData	= example.imageData;
	var dom			= example.dom;
	var stats		= example.stats;
	var drawing		= example.drawing;
	var t3d			= example.drawing3d.t3d;
	var trace		= example.trace;

	var brfManager	= null;
	var resolution	= null;

	var paused		= true;

	// This call initializes the library and put's all necessary date in RAM.
	initializeBRF(brfv4);

	// Tell the DrawingUtils where to draw to.
	if(drawing.setup && !drawing.stage) {
		drawing.setup(dom.getElement("_drawing"), dom.getElement("_faceSub"), 30);
	}

	// FPS meter
	if(stats.init) {
		stats.init(30);
	}

	// On imageData switch (webcam/picture) BRFv4 needs to reinit with the correct image sizes.
	example.reinit = function() {
		example.init(imageData.type());
	};

	// imageData available? Then update layout and reinit BRFv4.
	imageData.onAvailable = function(width, height) {

		trace("imageData.onAvailable: " + width + "x" + height);

		dom.updateLayout(width, height);
		resolution.setTo(0, 0, width, height);
		drawing.updateLayout(width, height);

		example.reinit();
	};

	// If the SDK didn't load yet (sdkReady is false) wait for it to do so.
	example.waitForSDK = function() {

		if(brfv4.sdkReady) {

			trace("waitForSDK: done.");
			example.init();

		} else {

			trace("waitForSDK: still waiting.");
			clearTimeout(example.waitForSDK_timeout);
			example.waitForSDK_timeout = setTimeout(function() {
				example.waitForSDK();
			}, 100);
		}
	};

	// Setup BRF and the imageData by chosen type (webcam/picture).
	example.init = function(type) {

		paused = true;

		if(imageData.type && type !== imageData.type() && imageData.isAvailable()) {
			drawing.setUpdateCallback(null);
			trace("imageData.dispose: " + imageData.type());
			imageData.dispose();
		}

		trace("init: type: " + type);

		if(!brfv4.sdkReady) {

			example.waitForSDK();

		} else {

			trace("-> brfv4.sdkReady: " + brfv4.sdkReady);

			if(brfv4.BRFManager && !brfManager) {
				brfManager	= new brfv4.BRFManager();
			}

			if(brfv4.Rectangle && !resolution) {
				resolution	= new brfv4.Rectangle(0, 0, 640, 480);
			}

			if(brfManager === null || resolution === null) {
				trace("Init failed!", true);
				return;
			}

			if(type === "picture") {	// Start either using an image ...

				imageData.picture.setup(
					dom.getElement("_imageData"),
					imageData.onAvailable
				);

			} else {				// ... or start using the webcam.

				imageData.webcam.setup(
					dom.getElement("_webcam"),
					dom.getElement("_imageData"),
					resolution,
					imageData.onAvailable
				);
			}

			trace("-> imageData.isAvailable (" + imageData.type() + "): " + imageData.isAvailable());

			if(imageData.isAvailable()) {

				setupBRFExample();

			} else {

				resolution.setTo(0, 0, 640, 480); // reset for webcam initialization
				imageData.init();
			}
		}
	};

	function setupBRFExample() {

		// Remove clicks and image overlay as well as 3d models.

		drawing.clickArea.mouseEnabled = false;
		drawing.imageContainer.removeAllChildren();
		if(t3d && t3d.hideAll) t3d.hideAll();

		// Reset BRFv4 to it's default parameters.
		// Every example may change these according to
		// its own needs in initCurrentExample().

		var size = resolution.height;

		if(resolution.height > resolution.width) {
			size = resolution.width;
		}

		brfManager.setMode(brfv4.BRFMode.FACE_TRACKING);
		brfManager.setNumFacesToTrack(1);

		brfManager.setFaceDetectionRoi(resolution);

		// more strict

		brfManager.setFaceDetectionParams(		size * 0.30, size * 1.00, 12, 8);
		brfManager.setFaceTrackingStartParams(	size * 0.30, size * 1.00, 22, 26, 22);
		brfManager.setFaceTrackingResetParams(	size * 0.25, size * 1.00, 40, 55, 32);

		// less strict

		// brfManager.setFaceDetectionParams(		size * 0.20, size * 1.00, 12, 8);
		// brfManager.setFaceTrackingStartParams(	size * 0.20, size * 1.00, 32, 46, 32);
		// brfManager.setFaceTrackingResetParams(	size * 0.15, size * 1.00, 40, 55, 32);

		// Initialize the example. See the specific files in js/examples

		example.initCurrentExample(brfManager, resolution, drawing);

		paused = false;

		if(imageData.isStream()) {

			// webcam continuous update.

			drawing.setUpdateCallback(updateBRFExample);

		} else {

			// Simply update 10 times for loaded images.
			// This is not the most sophisticated approach, but
			// will most likely do the job.

			drawing.clear();

			var imageDataCanvas	= dom.getElement("_imageData");

			imageData.update();				// depends on whether it is a webcam or image setup

			var data = imageDataCanvas.getContext("2d").getImageData(0, 0, resolution.width, resolution.height).data;

			for(var i = 0; i < 10; i++) {
				brfManager.update(data);
			}

			setTimeout(function() {
				example.updateCurrentExample(	// depends on the chosen example
					brfManager, data, drawing
				);
			}, 100);

		}
	}

	function updateBRFExample() {

		if(!paused) {

			if (stats.start) stats.start();

			var imageDataCanvas	= dom.getElement("_imageData");

			imageData.update();				// depends on whether it is a webcam or image setup

			example.updateCurrentExample(	// depends on the chosen example
				brfManager,
				imageDataCanvas.getContext("2d").getImageData(0, 0, resolution.width, resolution.height).data,
				drawing
			);

			if (stats.end) stats.end();
		}
	}
})();