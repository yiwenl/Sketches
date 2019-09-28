// Instead of a webcam stream you can choose a picture and analyze it.
//
// QuickSettings image chooser panel.
// First image in list is picked automatically.
//
// imageData handling using images:
//
// setupImage(imageDataCanvas, onImageDataReady) // canvas, callback

(function(){
	"use strict";

	var urlMap = {
		"Marcel":		"assets/brfv4_portrait_marcel.jpg",
		"Chris":		"assets/brfv4_portrait_chris.jpg",
		"woman old":	"assets/brfv4_woman_old.jpg",
		"women young":	"assets/brfv4_women_young.jpg",
		"Two Faces":	"assets/brfv4_two_faces.jpg"
	};
	var labels = [];
	for (var key in urlMap) { labels.push(key); } // Fill in the labels.

	var example		= brfv4Example;
	var trace		= example.trace;
	var dom			= example.dom;
	var imageData	= example.imageData;
	var gui			= example.gui;

	var picture		= imageData.picture;

	var _picture	= null;
	var _loader 	= null;
	var _onImageDataReady = null;

	picture.onImageLoaded = function(event) {
		_picture = event.result;

		if(_onImageDataReady) {
			_onImageDataReady(_picture.width, _picture.height);
		}
	};

	picture.onImageLoadError = function(event) {
		trace("Error loading image.", true);
	};

	picture.loadImage = function(url) {

		if(!url) return;

		_loader = new createjs.LoadQueue(true);
		_loader.on("fileload", picture.onImageLoaded);
		_loader.on("error", picture.onImageLoadError);
		_loader.loadFile(url);
	};

	picture.setup = function(imageDataCanvas, onImageDataReady) {

		if(!imageDataCanvas) {
			trace("Please add a <canvas> tag with id='_imageData' to the DOM.", true);
			return;
		}

		_onImageDataReady = onImageDataReady;

		imageData.type = function() {
			return "picture";
		};

		imageData.init = function() {
			if(labels.length > 0) {
				picture.loadImage(urlMap[labels[0]]);

				if(gui.pictureChooser) {
					gui.pictureChooser.show();
				}
			}
		};

		imageData.dispose = function() {
			_picture = null;
			if(gui.pictureChooser) {
				gui.pictureChooser.hide();
			}
		};

		imageData.isAvailable = function() {
			return _picture != null;
		};

		imageData.isStream = function() {
			return false;
		};

		imageData.update = function() {
			if(_picture != null) {
				var _imageDataCtx = imageDataCanvas.getContext("2d");
				_imageDataCtx.drawImage(_picture, 0, 0, _picture.width, _picture.height);
			}
		};
	};

	if(typeof QuickSettings === "undefined") return;

	function onImageChosen(data) {
		picture.loadImage(urlMap[data.value]);
	}

	if(!gui.pictureChooser) {

		QuickSettings.useExtStyleSheet();

		gui.pictureChooser = QuickSettings.create(
			2, 505, "Picture Chooser", dom.createDiv("_settingsRight"))
			.setWidth(250)
			.addHTML("Choose a picture from the list", "")
			.addDropDown("_picture", labels, onImageChosen)
			.hideTitle("_picture")
			.hide();
	}
})();