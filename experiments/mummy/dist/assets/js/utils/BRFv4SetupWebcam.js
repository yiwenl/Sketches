// webcam handling:
//
// setupStream(video, width, height, fps, callback)
// startStream()
// stopStream()
//
// onStreamFetched(mediaStream)
// onStreamDimensionsAvailable()
// onStreamError(event)
//
// imageData handling using webcam:
//
// setupWebcam(webcamVideo, imageDataCanvas, resolution, onImageDataReady) // video, canvas, Rectangle, callback

(function(){
	"use strict";

	var example			= brfv4Example;
	var imageData		= example.imageData;
	var trace			= example.trace;
	var webcam			= imageData.webcam;

	var ua				= window.navigator.userAgent;
	var isIOS11			= (ua.indexOf("iPad") > 0 || ua.indexOf("iPhone") > 0) && ua.indexOf("OS 11_") > 0;
	var stoppedOniOS	= 0;
	
	webcam.setupStream = function(video, width, height, fps, callback) {

		trace("webcam.setupStream: isPlaying: " + webcam.isPlaying);

		webcam.video			= video;
		webcam.constraints		= {video: {width: width, height: height, frameRate: fps}};
		webcam.onCameraReady	= callback;

		webcam.startStream();
	};

	webcam.startStream = function() {

		webcam.stopStream();

		trace("webcam.startStream: try: " +
			webcam.constraints.video.width + "x" + webcam.constraints.video.height);

		window.navigator.mediaDevices.getUserMedia(webcam.constraints)
			.then (webcam.onStreamFetched)
			.catch(webcam.onStreamError);
	};

	webcam.stopStream = function() {

		if(webcam.isPlaying) {
			trace("webcam.stopStream: isPlaying: " + webcam.isPlaying);
		}

		webcam.isPlaying = false;

		if (webcam.stream !== null) {
			webcam.stream.getTracks().forEach(function(track) {
				track.stop();
			});
			webcam.stream = null;
		}
		if(webcam.video !== null && webcam.video.srcObject !== null) {
			webcam.video.srcObject = null;
		}
	};

	webcam.onStreamFetched = function(mediaStream) {

		webcam.stream = mediaStream;

		if(webcam.video !== null) {
			webcam.video.srcObject = mediaStream;
			webcam.video.play();
			webcam.onStreamDimensionsAvailable();
		}
	};

	webcam.onStreamDimensionsAvailable = function() {

		// As we can't be sure, what resolution we get, we need to read it
		// from the already playing stream to be sure.

		if(webcam.video.videoWidth === 0) {

			trace("webcam.onStreamDimensionsAvailable: waiting");

			clearTimeout(webcam.onStreamDimensionsAvailable_timeout);

			webcam.onStreamDimensionsAvailable_timeout =
				setTimeout(webcam.onStreamDimensionsAvailable, 100);

		} else {

			trace("webcam.onStreamDimensionsAvailable: " + webcam.video.videoWidth + "x" + webcam.video.videoHeight);

			// Now we know the dimensions of the stream. So tell the app, the camera is ready.
			webcam.isPlaying = true;

			if (webcam.stream !== null && isIOS11 && stoppedOniOS === 0) {
				console.log('Turn off camera on iOS 11 and restart it later.');
				stoppedOniOS = 1;
				webcam.stream.getTracks().forEach(function(track) {
					track.stop();
				});
			}

			if(webcam.onCameraReady) {
				webcam.onCameraReady(true);
			}
		}
	};

	webcam.onStreamError = function(event) {
		trace("webcam.onStreamError: " + event);

		webcam.isPlaying = false;

		if(webcam.onCameraReady) {
			webcam.onCameraReady(false);
		}
	};

	webcam.setup = function(webcamVideo, imageDataCanvas, resolution, onImageDataReady) {

		if(!webcamVideo || !imageDataCanvas) {
			trace("setupWebcam: Please add a <video> tag with id='_webcam' and " +
				"a <canvas> tag with id='_imageData' to the DOM.", true);
			return;
		}

		if(!resolution) {
			trace("setupWebcam: Please setup a resolution Rectangle.", true);
			return;
		}

		function onCameraReady(success) {
			if(success) {
				onImageDataReady(webcamVideo.videoWidth, webcamVideo.videoHeight);
			} else {
				alert("No camera found.");
			}
		}

		imageData.type = function() {
			return "webcam";
		};

		imageData.init = function() {
			webcam.setupStream(webcamVideo, resolution.width, resolution.height, 30, onCameraReady);
		};

		imageData.dispose = function() {
			webcam.stopStream();
		};

		imageData.isAvailable = function() {
			return webcam.isPlaying;
		};

		imageData.isStream = function() {
			return true;
		};

		imageData.update = function() {

			//workaround the iOS startup hickup.
			if(isIOS11 && stoppedOniOS === 1) {
				stoppedOniOS = 2;

				// Start the camera stream again on iOS.
				setTimeout(function () {
					console.log('delayed camera restart for iOS 11 in 2 seconds.');
					webcam.setupStream(webcam.video, webcam.constraints.video.width, webcam.constraints.video.height, 30, null);
				}, 2000)
			}

			var _imageDataCtx = imageDataCanvas.getContext("2d");
			_imageDataCtx.setTransform(-1.0, 0, 0, 1, resolution.width, 0); // mirrored
			_imageDataCtx.drawImage(webcamVideo, 0, 0, resolution.width, resolution.height);
		};
	};
})();